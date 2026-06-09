"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ExternalLink, Calendar } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function GeneralSettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultAvatar = "https://ui-avatars.com/api/?name=User&background=random";

  const [profileImage, setProfileImage] = useState(defaultAvatar);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setProfileImage(imageUrl);
  };

  const handleRemoveImage = () => {
    setProfileImage(defaultAvatar);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-card text-card-foreground border rounded-xl overflow-hidden flex flex-col">
      <div className="p-8 pb-6">
        <h2 className="text-xl font-semibold mb-1">Public Profile</h2>

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

        {/* Profile Picture Upload Section */}
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 bg-muted shrink-0">
            <Image
              src={profileImage}
              alt="Profile Picture"
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <h3 className="text-sm font-medium mb-1">Profile Picture</h3>
            <p className="text-xs text-muted-foreground mb-3">
              JPG, GIF or PNG. 1MB max.
            </p>

            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={handleUploadClick}>
                Upload new
              </Button>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={handleRemoveImage}>
                Remove
              </Button>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <Label htmlFor="first-name">First Name</Label>
            <Input id="first-name" placeholder="Enter first name" defaultValue="ANIL SAI" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="last-name">Last Name</Label>
            <Input id="last-name" placeholder="Enter last name" defaultValue="NUNNA" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                @
              </span>
              <Input id="username" placeholder="Enter username" defaultValue="ANIL" className="pl-8" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="dob" placeholder="Pick a date" className="pl-9" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          Your profile URL:
          <span className="text-foreground">vextron.ai/@ANIL</span>
          <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
        </div>
      </div>

      <div className="p-6 border-t bg-muted/50 flex items-center justify-end gap-4 mt-auto">
        <Button variant="ghost">Discard</Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}