"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Plus, Trash2 } from "lucide-react"
import { fetchInstitutionById, updateInstitution } from "@/features/institutions/api"
import { isEmpty, isValidEmail, isValidPhone, inputErrorClass, errorTextClass } from "@/lib/validation"

export default function EditInstitutionPage() {

  const router = useRouter()
  const params = useParams()

  const [name,setName] = useState("")
  const [email,setEmail] = useState("")
  const [location,setLocation] = useState("")

  const [contacts,setContacts] = useState([
    {name:"",role:"",email:"",phone:""}
  ])

  const [isLoading, setIsLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const handleFieldBlur = (field: string, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    validateField(field, value)
  }

  useEffect(() => {
    const loadInstitution = async () => {
      if (!params?.id) return

      try {
        setIsLoading(true)
        const inst = await fetchInstitutionById(params.id as string)

        if (inst) {
          setName(inst.name)
          setEmail(inst.email)
          setLocation(inst.location || "")
          if (inst.contacts && inst.contacts.length > 0) setContacts(inst.contacts as { name: string; role: string; email: string; phone: string }[])
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("Failed to load institution:", message)
        setError(message || "Failed to load institution")
        
        // Fallback to localStorage for compatibility
        const stored = JSON.parse(localStorage.getItem("institutions") || "[]")
        const inst = stored.find((i: Record<string, unknown>) => i.id === params?.id)
        if (inst) {
          setName(inst.name as string)
          setEmail(inst.email as string)
          setLocation(inst.location as string)
          if (Array.isArray(inst.contacts) && inst.contacts.length > 0) setContacts(inst.contacts)
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadInstitution()
  }, [params?.id])

  const addContact = () => {

    if(contacts.length < 3){
      setContacts([
        ...contacts,
        {name:"",role:"",email:"",phone:""}
      ])
    }

  }

  const removeContact=(index:number)=>{
    setContacts(
      contacts.filter((_,i)=>i!==index)
    )
  }

  const handleChange=(
    index:number,
    field:string,
    value:string
  )=>{

    const updated=[...contacts]

    updated[index][
      field as keyof typeof updated[number]
    ] = value

    setContacts(updated)
  }



  const validateField = (field: string, value: string): string => {
    let error = ""
    switch (field) {
      case "name":
        if (isEmpty(value)) error = "Institution name is required"
        break
      case "email":
        if (isEmpty(value)) error = "Email is required"
        else if (!isValidEmail(value)) error = "Invalid email format"
        break
      case "location":
        if (isEmpty(value)) error = "Location is required"
        break
    }
    setErrors(prev => {
      if (error) return { ...prev, [field]: error }
      const n = { ...prev }; delete n[field]; return n
    })
    return error
  }

  const validateContacts = (): boolean => {
    const newErrors: Record<string, string> = {}
    let hasError = false
    contacts.forEach((c, i) => {
      if (isEmpty(c.name)) { newErrors[`c_${i}_name`] = "Name required"; hasError = true }
      if (!isEmpty(c.email) && !isValidEmail(c.email)) { newErrors[`c_${i}_email`] = "Invalid email"; hasError = true }
      if (!isEmpty(c.phone) && !isValidPhone(c.phone)) { newErrors[`c_${i}_phone`] = "Invalid phone"; hasError = true }
    })
    setErrors(prev => ({ ...prev, ...newErrors }))
    return !hasError
  }

  const validateAll = (): boolean => {
    const allTouched: Record<string, boolean> = {}
    let hasError = false
    for (const [field, value] of [["name", name], ["email", email], ["location", location]] as [string, string][]) {
      allTouched[field] = true
      if (validateField(field, value)) hasError = true
    }
    const contactsValid = validateContacts()
    setTouched(prev => ({ ...prev, ...allTouched }))
    return !hasError && contactsValid
  }

  const getInputClass = (field: string) => {
    const base = "w-full border rounded-lg px-3 py-2 text-gray-900 transition-all duration-200"
    return touched[field] && errors[field] ? `${base} ${inputErrorClass}` : base
  }

  const ErrorMsg = ({ field }: { field: string }) => {
    if (!touched[field] || !errors[field]) return null
    return (
      <p className={errorTextClass}>
        <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
        {errors[field]}
      </p>
    )
  }

  const handleUpdate = async () => {
    if (!validateAll()) return

    setSubmitting(true)
    setError(null)

    try {
      const payload = {
        name,
        email,
        location,
        contacts,
      }

      await updateInstitution(params?.id as string, payload)
      router.push("/admin/institutions")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Failed to update institution:", message)
      setError(message || "Failed to update institution")
    } finally {
      setSubmitting(false)
    }
  }

  return (

    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">

      <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-lg p-8">

        {/* Header */}

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-lg font-semibold text-gray-900">
            Edit Institution Details
          </h2>

          <Link
            href="/admin/institutions"
            className="text-gray-500"
          >
            ✕
          </Link>

        </div>

        {isLoading ? (
          <div className="py-20 text-center text-gray-500 italic">
            Loading institution details...
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100 flex items-center gap-2">
                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                 {error}
              </div>
            )}
            
            {/* Institution Info */}

            <div className="space-y-4">

              <div>

                <label className="text-xs text-gray-600">
                  Institution Name <span className="text-red-400">*</span>
                </label>

                <input
                  value={name}
                  onChange={(e)=>setName(e.target.value)}
                  onBlur={() => handleFieldBlur("name", name)}
                  className={getInputClass("name")}
                />
                <ErrorMsg field="name" />

              </div>

              <div className="grid grid-cols-2 gap-4">

                <div>

                  <label className="text-xs text-gray-600">
                    Official Email <span className="text-red-400">*</span>
                  </label>

                  <input
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                    onBlur={() => handleFieldBlur("email", email)}
                    className={getInputClass("email")}
                  />
                  <ErrorMsg field="email" />

                </div>

                <div>

                  <label className="text-xs text-gray-600">
                    Location <span className="text-red-400">*</span>
                  </label>

                  <input
                    value={location}
                    onChange={(e)=>setLocation(e.target.value)}
                    onBlur={() => handleFieldBlur("location", location)}
                    className={getInputClass("location")}
                  />
                  <ErrorMsg field="location" />

                </div>

              </div>

            </div>

            {/* Contacts */}

            <div className="mt-6">

              <div className="flex justify-between items-center mb-3">

                <h3 className="text-sm font-medium text-gray-900">
                  Point of Contacts
                </h3>

                <button
                  onClick={addContact}
                  className="flex items-center gap-1 text-blue-600 text-sm"
                >
                  <Plus size={16}/>
                  Add
                </button>

              </div>

              {contacts.map((contact,index)=>(

                <div
                  key={index}
                  className="border rounded-lg p-4 mb-4 space-y-3"
                >

                  <div className="flex justify-between">

                    <span className="text-xs text-gray-600">
                      Contact {index+1}
                    </span>

                    {contacts.length>1 &&(

                      <button
                        onClick={()=>removeContact(index)}
                      >
                        <Trash2
                          size={16}
                          className="text-red-500"
                        />
                      </button>

                    )}

                  </div>

                  <div className="grid grid-cols-2 gap-4">

                    <input
                      placeholder="Name"
                      className="border rounded-lg px-3 py-2 text-gray-900"
                      value={contact.name}
                      onChange={(e)=>
                        handleChange(
                          index,
                          "name",
                          e.target.value
                        )
                      }
                    />

                    <input
                      placeholder="Role"
                      className="border rounded-lg px-3 py-2 text-gray-900"
                      value={contact.role}
                      onChange={(e)=>
                        handleChange(
                          index,
                          "role",
                          e.target.value
                        )
                      }
                    />

                  </div>

                  <div className="grid grid-cols-2 gap-4">

                    <input
                      placeholder="Email"
                      className="border rounded-lg px-3 py-2 text-gray-900"
                      value={contact.email}
                      onChange={(e)=>
                        handleChange(
                          index,
                          "email",
                          e.target.value
                        )
                      }
                    />

                    <input
                      placeholder="Phone"
                      className="border rounded-lg px-3 py-2 text-gray-900"
                      value={contact.phone}
                      onChange={(e)=>
                        handleChange(
                          index,
                          "phone",
                          e.target.value
                        )
                      }
                    />

                  </div>

                </div>

              ))}

            </div>

            {/* Footer */}

            <div className="flex justify-end gap-4 mt-6">

              <Link
                href="/admin/institutions"
                className="text-gray-600 flex items-center"
              >
                Cancel
              </Link>

              <button
                onClick={handleUpdate}
                disabled={submitting}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Updating..." : "Update Institution"}
              </button>

            </div>
          </>
        )}

      </div>

    </div>

  )
}