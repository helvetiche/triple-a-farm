import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Camera, Save } from "lucide-react"
import Link from "next/link"

export const description = "Triple A Gamefarm Profile Settings"

export default function ProfileSettingsPage() {
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-6 p-6">
              {/* Page Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-[#1f3f2c]">Profile Settings</h1>
                  <p className="text-[#4a6741]">Update your personal information and profile details</p>
                </div>
                <Button variant="outline" className="border-[#3d6c58]/20">
                  <Link href="/admin/settings">← Back to Settings</Link>
                </Button>
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                {/* Profile Picture Section */}
                <Card className="border-[#3d6c58]/20 lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="text-[#1f3f2c]">Profile Picture</CardTitle>
                    <CardDescription>Update your profile photo</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center space-y-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src="/avatars/farm-manager.jpg" alt="Profile" />
                      <AvatarFallback>FM</AvatarFallback>
                    </Avatar>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="border-[#3d6c58]/20">
                        <Camera className="h-4 w-4 " />
                        Change Photo
                      </Button>
                      <Button variant="outline" size="sm" className="border-[#3d6c58]/20">
                        Remove
                      </Button>
                    </div>
                    <p className="text-xs text-[#4a6741] text-center">
                      JPG, GIF or PNG. Max size of 2MB
                    </p>
                  </CardContent>
                </Card>

                {/* Personal Information Section */}
                <Card className="border-[#3d6c58]/20 lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-[#1f3f2c]">Personal Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" placeholder="John" className="border-[#3d6c58]/20" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" placeholder="Doe" className="border-[#3d6c58]/20" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" placeholder="manager@tripleagamefarm.com" className="border-[#3d6c58]/20" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" placeholder="+63 912 345 6789" className="border-[#3d6c58]/20" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Input id="role" placeholder="Farm Manager" className="border-[#3d6c58]/20" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea 
                        id="bio" 
                        placeholder="Tell us about yourself and your role at the farm..."
                        className="border-[#3d6c58]/20"
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Farm Information Section */}
                <Card className="border-[#3d6c58]/20 lg:col-span-3">
                  <CardHeader>
                    <CardTitle className="text-[#1f3f2c]">Farm Information</CardTitle>
                    <CardDescription>Details about your farm operation</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="farmName">Farm Name</Label>
                        <Input id="farmName" placeholder="Triple A Gamefarm" className="border-[#3d6c58]/20" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="farmLocation">Farm Location</Label>
                        <Input id="farmLocation" placeholder="Batangas, Philippines" className="border-[#3d6c58]/20" />
                      </div>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="farmSize">Farm Size</Label>
                        <Input id="farmSize" placeholder="5 hectares" className="border-[#3d6c58]/20" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="established">Established</Label>
                        <Input id="established" placeholder="2010" className="border-[#3d6c58]/20" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="specialization">Specialization</Label>
                      <Input id="specialization" placeholder="Gamefowl breeding, Kelso, Sweater, Roundhead" className="border-[#3d6c58]/20" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4">
                <Button variant="outline" className="border-[#3d6c58]/20">
                  Cancel
                </Button>
                <Button className="bg-[#3d6c58] hover:bg-[#4e816b]">
                  <Save className="h-4 w-4 " />
                  Save Changes
                </Button>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}
