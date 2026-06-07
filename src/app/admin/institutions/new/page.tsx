"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus, Trash2 } from "lucide-react"
import { createInstitution } from "@/features/admin/institutions/api/institution-api"
import { isEmpty, isValidEmail, hasMinLength, isValidPhone, inputErrorClass, errorTextClass } from "@/lib/validation"

export default function AddInstitutionPage() {

  const router = useRouter()

  const [name,setName] = useState("")
  const [email,setEmail] = useState("")
  const [location,setLocation] = useState("")

  const [contacts, setContacts] = useState([
    { name: "", role: "", email: "", phone: "" },
  ])

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [formError, setFormError] = useState("")

  const addContact = () => {
    if (contacts.length < 3) {
      setContacts([...contacts, { name: "", role: "", email: "", phone: "" }])
    }
  }

  const removeContact = (index:number) => {
    const updated = contacts.filter((_,i)=>i!==index)
    setContacts(updated)
  }

  const handleChange = (index:number,field:string,value:string)=>{
    const updated=[...contacts]
    updated[index][field as keyof typeof updated[number]] = value
    setContacts(updated)

    // Clear contact-specific error
    const key = `contact_${index}_${field}`
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  const handleFieldBlur = (field: string, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    validateField(field, value)
  }

  const validateField = (field: string, value: string): string => {
    let error = ""

    switch (field) {
      case "name":
        if (isEmpty(value)) error = "Institution name is required"
        else if (!hasMinLength(value, 2)) error = "Name must be at least 2 characters"
        break
      case "email":
        if (isEmpty(value)) error = "Official email is required"
        else if (!isValidEmail(value)) error = "Please enter a valid email address"
        break
      case "location":
        if (isEmpty(value)) error = "Location is required"
        break
    }

    setErrors((prev) => {
      if (error) return { ...prev, [field]: error }
      const next = { ...prev }
      delete next[field]
      return next
    })

    return error
  }

  const validateContacts = (): boolean => {
    const newErrors: Record<string, string> = {}
    let hasError = false

    contacts.forEach((contact, index) => {
      if (isEmpty(contact.name)) {
        newErrors[`contact_${index}_name`] = "Contact name is required"
        hasError = true
      }
      if (!isEmpty(contact.email) && !isValidEmail(contact.email)) {
        newErrors[`contact_${index}_email`] = "Invalid email format"
        hasError = true
      }
      if (!isEmpty(contact.phone) && !isValidPhone(contact.phone)) {
        newErrors[`contact_${index}_phone`] = "Invalid phone number"
        hasError = true
      }
    })

    setErrors((prev) => ({ ...prev, ...newErrors }))
    return !hasError
  }

  const validateAll = (): boolean => {
    const fields = ["name", "email", "location"]
    const allTouched: Record<string, boolean> = {}
    let hasError = false

    for (const field of fields) {
      allTouched[field] = true
      const values: Record<string, string> = { name, email, location }
      const error = validateField(field, values[field])
      if (error) hasError = true
    }

    const contactsValid = validateContacts()

    setTouched((prev) => ({ ...prev, ...allTouched }))
    return !hasError && contactsValid
  }

  const [submitting, setSubmitting] = useState(false)
  
  const handleSubmit = async () => {
    setFormError("")

    if (!validateAll()) {
      setFormError("Please fix the errors above before submitting.")
      return
    }

    try {
      setSubmitting(true)
      
      const payload = {
        name,
        email,
        location,
        status: "Active",
        contacts: contacts.map(c => ({
          name: c.name,
          role: c.role,
          email: c.email,
          phone: c.phone
        }))
      }

      await createInstitution(payload)
      
      // Update local storage as a cache fallback if necessary
      const existing = JSON.parse(localStorage.getItem("institutions") || "[]")
      localStorage.setItem(
        "institutions",
        JSON.stringify([{ ...payload, id: `INST-${Date.now()}` }, ...existing])
      )

      router.push("/admin/institutions")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Failed to create institution:", message)
      setFormError(message || "Failed to create institution. Please check your connection.")
    } finally {
      setSubmitting(false)
    }
  }

  const getInputClass = (field: string) => {
    const base = "w-full border rounded-lg px-3 py-2 text-foreground transition-all duration-200"
    return touched[field] && errors[field] ? `${base} ${inputErrorClass}` : base
  }

  const getContactInputClass = (index: number, field: string) => {
    const key = `contact_${index}_${field}`
    const base = "border rounded-lg px-3 py-2 text-foreground transition-all duration-200"
    return errors[key] ? `${base} ${inputErrorClass}` : base
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

  const ContactErrorMsg = ({ index, field }: { index: number, field: string }) => {
    const key = `contact_${index}_${field}`
    if (!errors[key]) return null
    return (
      <p className={errorTextClass}>
        <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
        {errors[key]}
      </p>
    )
  }

  return (

    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">

      <div className="max-w-3xl w-full max-h-[90vh] overflow-y-auto bg-card border rounded-xl shadow p-8">

        {/* Title */}

        <div className="flex justify-between items-center mb-6">

          <h1 className="text-xl font-semibold text-foreground">
            Register New Institution
          </h1>

          <Link href="/admin/institutions" className="text-muted-foreground">
            ✕
          </Link>

        </div>

        {/* Institution Info */}

        <div className="space-y-4">

          <div>
            <label className="text-sm text-card-foreground">
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
              <label className="text-sm text-card-foreground">
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
              <label className="text-sm text-card-foreground">
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

            <h2 className="text-sm font-medium text-foreground">
              Point of Contacts
            </h2>

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

                <span className="text-xs text-muted-foreground">
                  Contact {index+1}
                </span>

                {contacts.length>1 &&(
                  <button onClick={()=>removeContact(index)}>
                    <Trash2 size={16} className="text-red-500"/>
                  </button>
                )}

              </div>

              <div className="grid grid-cols-2 gap-4">

                <div>
                  <input
                    placeholder="Name *"
                    className={getContactInputClass(index, "name")}
                    value={contact.name}
                    onChange={(e)=>handleChange(index,"name",e.target.value)}
                  />
                  <ContactErrorMsg index={index} field="name" />
                </div>

                <input
                  placeholder="Role"
                  className="border rounded-lg px-3 py-2 text-foreground"
                  value={contact.role}
                  onChange={(e)=>handleChange(index,"role",e.target.value)}
                />

              </div>

              <div className="grid grid-cols-2 gap-4">

                <div>
                  <input
                    placeholder="Email"
                    className={getContactInputClass(index, "email")}
                    value={contact.email}
                    onChange={(e)=>handleChange(index,"email",e.target.value)}
                  />
                  <ContactErrorMsg index={index} field="email" />
                </div>

                <div>
                  <input
                    placeholder="Phone"
                    className={getContactInputClass(index, "phone")}
                    value={contact.phone}
                    onChange={(e)=>handleChange(index,"phone",e.target.value)}
                  />
                  <ContactErrorMsg index={index} field="phone" />
                </div>

              </div>

            </div>
          ))}

        </div>

        {/* Form Error */}
        {formError && (
          <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
            {formError}
          </p>
        )}

        {/* Buttons */}

        <div className="flex justify-end gap-4 mt-6">

          <Link
            href="/admin/institutions"
            className="px-4 py-2 text-card-foreground"
          >
            Cancel
          </Link>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Registering..." : "Register Institution"}
          </button>

        </div>

      </div>

    </div>
  )
}
