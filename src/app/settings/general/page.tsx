"use client";

import { useEffect, useRef, useState } from "react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ExternalLink, Loader2, Camera } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ExternalLink, Loader2, Camera } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProfile, useUpdateProfile } from "@/features/profile/api/profile-api";
import { ImageCropperModal } from "@/components/ui/ImageCropperModal";

// Fields to completely ignore (not even read-only)
const IGNORED_FIELDS = ["id", "password", "profile_image", "avatar", "tutor_id", "user_id"];

// Fields that should be displayed but not editable
const READ_ONLY_FIELDS = ["role", "created_date", "created_at", "updated_at", "allocated_batches", "allocated_batches_count"];

// Helper to get a random color class for badges based on a string
const getBadgeColor = (str: string) => {
  const colors = [
    "bg-blue-500/10 text-blue-500 border-blue-500/20",
    "bg-green-500/10 text-green-500 border-green-500/20",
    "bg-purple-500/10 text-purple-500 border-purple-500/20",
    "bg-amber-500/10 text-amber-500 border-amber-500/20",
    "bg-pink-500/10 text-pink-500 border-pink-500/20",
    "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function GeneralSettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const defaultAvatar = "https://ui-avatars.com/api/?name=User&background=random";
  
  const { data: profileResponse, isLoading: isLoadingProfile } = useProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
  
  
  const { data: profileResponse, isLoading: isLoadingProfile } = useProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
  
  const [profileImage, setProfileImage] = useState(defaultAvatar);
  const [formData, setFormData] = useState<Record<string, any>>({});
  
  // Cropper State
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [selectedImageForCrop, setSelectedImageForCrop] = useState<string | null>(null);
  
  const profileData = profileResponse?.data || profileResponse || {};

  useEffect(() => {
    if (!isLoadingProfile && Object.keys(profileData).length > 0) {
      const nameForAvatar = profileData.name || profileData.full_name || profileData.first_name || "User";
      setProfileImage(profileData.profile_image || profileData.avatar || `https://ui-avatars.com/api/?name=${nameForAvatar.replace(/\s+/g, '+')}&background=random`);
      
      const initialData: Record<string, any> = {};
      Object.keys(profileData).forEach(key => {
        if (!IGNORED_FIELDS.includes(key) && !READ_ONLY_FIELDS.includes(key)) {
          // Flatten simple string arrays, ignore object arrays here
          if (Array.isArray(profileData[key])) {
             if (profileData[key].length > 0 && typeof profileData[key][0] !== 'object') {
               initialData[key] = profileData[key].join(", ");
             }
          } else {
            // Convert nulls to empty strings to avoid controlled input warnings
            initialData[key] = profileData[key] !== null && profileData[key] !== undefined ? String(profileData[key]) : "";
          }
        }
      });
      setFormData(initialData);
    }
  }, [isLoadingProfile, profileResponse]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create an object URL for the cropper instead of reading immediately
    // Create an object URL for the cropper instead of reading immediately
    const imageUrl = URL.createObjectURL(file);
    setSelectedImageForCrop(imageUrl);
    setIsCropperOpen(true);
    
    // Reset the input so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const handleCropperClose = () => {
    setIsCropperOpen(false);
    if (selectedImageForCrop) {
      URL.revokeObjectURL(selectedImageForCrop);
      setSelectedImageForCrop(null);
    }
  };
  
  const handleCropComplete = (croppedBase64: string) => {
    setProfileImage(croppedBase64);
    setFormData(prev => ({ ...prev, profile_image: croppedBase64 }));
    handleCropperClose();
  };

  const handleRemoveImage = () => {
    const nameForAvatar = profileData.name || profileData.full_name || profileData.first_name || "User";
    const fallback = `https://ui-avatars.com/api/?name=${nameForAvatar.replace(/\s+/g, '+')}&background=random`;
    setProfileImage(fallback);
    setFormData(prev => ({ ...prev, profile_image: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const dataURLtoFile = (dataurl: string, filename: string) => {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleSaveChanges = () => {
    const processedData = { ...formData };
    
    // Strip out fields that the backend doesn't allow updating via this endpoint
    const disallowedFields = [
      "email", "status", "role", "created_date", "created_at", 
      "updated_at", "allocated_batches", "allocated_batches_count",
      "avatar"
    ];
    disallowedFields.forEach(field => {
      delete processedData[field];
    });

    const payload = new FormData();
    Object.entries(processedData).forEach(([key, value]) => {
      if (key === "profile_image" && typeof value === "string" && value.startsWith("data:image")) {
        // Convert base64 to File object
        const file = dataURLtoFile(value, "profile.jpg");
        payload.append(key, file);
      } else if (value !== null && value !== undefined && value !== "") {
        payload.append(key, value as string);
      }
    });
    
    updateProfile(payload, {
      onSuccess: () => {
        toast.success("Profile updated", {
          description: "Your profile has been updated successfully.",
        });
      },
      onError: (error) => {
        toast.error("Update failed", {
          description: error.message || "Failed to update profile.",
        });
      }
    });
  };

  const handleDiscard = () => {
    if (profileData) {
      const nameForAvatar = profileData.name || profileData.full_name || profileData.first_name || "User";
      setProfileImage(profileData.profile_image || profileData.avatar || `https://ui-avatars.com/api/?name=${nameForAvatar.replace(/\s+/g, '+')}&background=random`);
      
      const initialData: Record<string, any> = {};
      Object.keys(profileData).forEach(key => {
        if (!IGNORED_FIELDS.includes(key) && !READ_ONLY_FIELDS.includes(key)) {
          if (Array.isArray(profileData[key])) {
             if (profileData[key].length > 0 && typeof profileData[key][0] !== 'object') {
               initialData[key] = profileData[key].join(", ");
             }
          } else {
            initialData[key] = profileData[key] !== null && profileData[key] !== undefined ? String(profileData[key]) : "";
          }
        }
      });
      setFormData(initialData);
    }
  };

  const formatLabel = (key: string) => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const renderReadOnlyField = (key: string, value: any) => {
    if (!value) return null;

    if (key === "role") {
      return <Input disabled value={String(value).toUpperCase()} />;
    }

    if (key.includes("date") || key.includes("_at")) {
      try {
        const dateStr = format(new Date(value), "PPP");
        return <Input disabled value={dateStr} />;
      } catch (e) {
        // Fallback if not valid date
        return <Input disabled value={String(value)} />;
      }
    }

    if (key === "allocated_batches" && Array.isArray(value)) {
      return (
        <div className="flex flex-wrap gap-2 items-center p-2.5 bg-muted/50 rounded-lg border min-h-10 opacity-70">
          {value.length === 0 ? (
            <span className="text-sm text-muted-foreground">No batches allocated</span>
          ) : (
            value.map((batch: any, i: number) => {
              const batchName = typeof batch === 'object' ? (batch.name || batch.batch_name || batch.title || `Batch ${i+1}`) : String(batch);
              return (
                <Badge key={i} variant="outline" className={`font-normal ${getBadgeColor(batchName)}`}>
                  {batchName}
                </Badge>
              );
            })
          )}
        </div>
      );
    }

    return <Input disabled value={String(value)} />;
  };

  if (isLoadingProfile) {
    return (
      <div className="bg-card text-card-foreground border rounded-xl overflow-hidden flex flex-col p-8 space-y-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
        <div className="flex items-center gap-6">
          <Skeleton className="w-24 h-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-16 rounded-md" />
          <Skeleton className="h-16 rounded-md" />
          <Skeleton className="h-16 rounded-md" />
          <Skeleton className="h-16 rounded-md" />
        </div>
      </div>
    );
  }

  // Extract read-only entries present in profile
  const readOnlyEntries = Object.entries(profileData).filter(([k]) => READ_ONLY_FIELDS.includes(k) && profileData[k] !== undefined && profileData[k] !== null);

  return (
    <div className="bg-card text-card-foreground border rounded-xl overflow-hidden flex flex-col">
      <div className="p-8 pb-6">
        <h2 className="text-2xl font-bold mb-2">Public Profile</h2>
        
        <p className="text-sm text-muted-foreground mb-8">
          This information will be displayed publicly so be careful what you share.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/gif"
          className="hidden"
          onChange={handleImageChange}
        />

        {/* Improved Profile Picture Upload Section */}
        <div className="flex items-center gap-6 mb-10">
          <div 
            className="group relative w-24 h-24 rounded-full overflow-hidden border-2 bg-muted shrink-0 cursor-pointer transition-transform hover:scale-105"
            onClick={handleUploadClick}
          >
            <Image
              src={profileImage}
              alt="Profile Picture"
              fill
              className="object-cover"
              fill
              className="object-cover"
              unoptimized
              priority
            />
            {/* Dark overlay specifically for image hover to ensure visibility of camera icon regardless of theme */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-white mb-1" />
              <span className="text-[10px] font-medium text-white uppercase tracking-wider">Change</span>
            </div>
            {/* Dark overlay specifically for image hover to ensure visibility of camera icon regardless of theme */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-white mb-1" />
              <span className="text-[10px] font-medium text-white uppercase tracking-wider">Change</span>
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold mb-1">Profile Picture</h3>
            <p className="text-xs text-muted-foreground mb-4">
              JPG, GIF or PNG. 1MB max. Click the avatar to upload.
            <h3 className="text-base font-semibold mb-1">Profile Picture</h3>
            <p className="text-xs text-muted-foreground mb-4">
              JPG, GIF or PNG. 1MB max. Click the avatar to upload.
            </p>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleUploadClick}>
                Upload new
              </Button>
            </div>
          </div>
        </div>

        {/* Dynamic Form Fields (Editable) */}
        <h3 className="text-lg font-medium mb-4 border-b pb-2">Personal Information</h3>
        {Object.keys(formData).filter(k => !IGNORED_FIELDS.includes(k)).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-10">
            {Object.entries(formData)
              .filter(([key]) => !IGNORED_FIELDS.includes(key) && key !== "status")
              .map(([key, value]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key} className="font-medium">{formatLabel(key)}</Label>
                <Input 
                  id={key} 
                  placeholder={`Enter ${formatLabel(key).toLowerCase()}`} 
                  value={value || ""}
                  disabled={key === "email"} 
                  onChange={(e) => handleInputChange(key, e.target.value)}
                />
              </div>
            ))}
            
            {/* Dynamic Status Dropdown */}
            {formData.status !== undefined && (
              <div className="space-y-2">
                <Label htmlFor="status" className="font-medium">Status</Label>
                <Select value={String(formData.status || "inactive").toLowerCase()} onValueChange={(val) => handleInputChange("status", val)}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground border border-dashed rounded-xl mb-10 bg-muted/20">
            No editable profile fields found.
        ) : (
          <div className="text-center py-8 text-muted-foreground border border-dashed rounded-xl mb-10 bg-muted/20">
            No editable profile fields found.
          </div>
        )}

        {/* Read-Only Fields */}
        {readOnlyEntries.length > 0 && (
          <>
            <h3 className="text-lg font-medium mb-4 border-b pb-2">System Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-6">
              {readOnlyEntries.map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label className="text-muted-foreground font-medium block">{formatLabel(key)}</Label>
                  {renderReadOnlyField(key, value)}
                </div>
              ))}
        )}

        {/* Read-Only Fields */}
        {readOnlyEntries.length > 0 && (
          <>
            <h3 className="text-lg font-medium mb-4 border-b pb-2">System Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-6">
              {readOnlyEntries.map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label className="text-muted-foreground font-medium block">{formatLabel(key)}</Label>
                  {renderReadOnlyField(key, value)}
                </div>
              ))}
            </div>
          </>
        )}
          </>
        )}
      </div>

      <div className="p-6 border-t bg-muted/50 flex items-center justify-end gap-4 mt-auto">
        <Button variant="ghost" onClick={handleDiscard} disabled={isUpdating}>
          Discard
        </Button>
        <Button onClick={handleSaveChanges} disabled={isUpdating}>
          {isUpdating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Save Changes"}
        </Button>
      </div>

      {/* Profile Image Cropper Modal */}
      <ImageCropperModal
        isOpen={isCropperOpen}
        imageSrc={selectedImageForCrop}
        onClose={handleCropperClose}
        onCropComplete={handleCropComplete}
      />

      {/* Profile Image Cropper Modal */}
      <ImageCropperModal
        isOpen={isCropperOpen}
        imageSrc={selectedImageForCrop}
        onClose={handleCropperClose}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}