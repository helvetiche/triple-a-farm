"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import { SettingsNav } from "@/components/dashboard/settings-nav"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { User, Key, Edit3, Save, X } from "lucide-react"
import { toast } from "sonner"
import {
  SettingsNavSkeleton,
  SettingsPageHeaderSkeleton,
  GeneralSettingsSkeleton
} from "./components/skeleton-loading"

export const description = "Triple A Gamefarm Settings"

export default function SettingsPage() {
  const [generalData, setGeneralData] = useState({
    farmName: "Triple A GameFarm",
    email: "tripleagamefarm5@gmail.com",
    phone: "+63 912 345 6789",
    address: "123 Farm Road, countryside",
description: "Breeding championship-quality gamefowl with excellence in bloodlines, training, and customer service."
  })

  const [isEditingGeneral, setIsEditingGeneral] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleGeneralSave = () => {
    toast.success("General settings saved successfully")
    setIsEditingGeneral(false)
  }

  const handleGeneralCancel = () => {
    // Reset to original values
    setGeneralData({
      farmName: "Triple A GameFarm",
      email: "tripleagamefarm5@gmail.com",
      phone: "+63 912 345 6789",
      address: "123 Farm Road, countryside",
description: "Breeding championship-quality gamefowl with excellence in bloodlines, training, and customer service."
    })
    setIsEditingGeneral(false)
  }

  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
              {/* Page Header */}
              {isLoading ? (
                <SettingsPageHeaderSkeleton />
              ) : (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <h1 className="text-3xl font-bold text-[#1f3f2c]">Settings</h1>
                    <p className="text-[#4a6741]">Manage your account and application preferences</p>
                  </div>
                </div>
              )}

              {/* Settings Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Settings Navigation */}
                <div className="lg:col-span-1">
                  {isLoading ? (
                    <SettingsNavSkeleton />
                  ) : (
                    <SettingsNav />
                  )}
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                  {/* General Settings Card */}
                  {isLoading ? (
                    <GeneralSettingsSkeleton />
                  ) : (
                    <Card className="border-[#3d6c58]/20" style={{ borderRadius: 0 }}>
                      <CardHeader style={{ borderRadius: 0 }}>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <CardTitle className="flex items-center gap-2 text-[#1f3f2c]">
                              <User className="h-5 w-5" />
                              General Settings
                            </CardTitle>
                            <CardDescription>
                              Update your farm information and contact details
                            </CardDescription>
                          </div>
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-2">
                            {isEditingGeneral && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleGeneralCancel}
                                className="flex items-center gap-2 border-[#3d6c58]/20 w-full sm:w-auto"
                              >
                                <X className="h-4 w-4" />
                                Cancel
                              </Button>
                            )}
                            <Button
                              variant={isEditingGeneral ? "default" : "outline"}
                              size="sm"
                              onClick={isEditingGeneral ? handleGeneralSave : () => setIsEditingGeneral(true)}
                              className={`flex items-center gap-2 w-full sm:w-auto ${isEditingGeneral ? "bg-[#3d6c58] hover:bg-[#4e816b]" : "border-[#3d6c58]/20"}`}
                            >
                              {isEditingGeneral ? (
                                <>
                                  <Save className="h-4 w-4" />
                                  Save
                                </>
                              ) : (
                                <>
                                  <Edit3 className="h-4 w-4" />
                                  Edit
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4" style={{ borderRadius: 0 }}>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="farmName" className="text-[#3d6c58]">Farm Name</Label>
                            <Input
                              id="farmName"
                              value={generalData.farmName}
                              onChange={(e) => setGeneralData({...generalData, farmName: e.target.value})}
                              className="border-[#3d6c58]/20"
                              disabled={!isEditingGeneral}
                              style={{ 
                                backgroundColor: !isEditingGeneral ? '#f8fafc' : 'white',
                                borderRadius: 0 
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-[#3d6c58]">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={generalData.email}
                              onChange={(e) => setGeneralData({...generalData, email: e.target.value})}
                              className="border-[#3d6c58]/20"
                              disabled={!isEditingGeneral}
                              style={{ 
                                backgroundColor: !isEditingGeneral ? '#f8fafc' : 'white',
                                borderRadius: 0 
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone" className="text-[#3d6c58]">Phone</Label>
                            <Input
                              id="phone"
                              value={generalData.phone}
                              onChange={(e) => setGeneralData({...generalData, phone: e.target.value})}
                              className="border-[#3d6c58]/20"
                              disabled={!isEditingGeneral}
                              style={{ 
                                backgroundColor: !isEditingGeneral ? '#f8fafc' : 'white',
                                borderRadius: 0 
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="address" className="text-[#3d6c58]">Address</Label>
                            <Input
                              id="address"
                              value={generalData.address}
                              onChange={(e) => setGeneralData({...generalData, address: e.target.value})}
                              className="border-[#3d6c58]/20"
                              disabled={!isEditingGeneral}
                              style={{ 
                                backgroundColor: !isEditingGeneral ? '#f8fafc' : 'white',
                                borderRadius: 0 
                              }}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description" className="text-[#3d6c58]">Description</Label>
                          <Textarea
                            id="description"
                            value={generalData.description}
                            onChange={(e) => setGeneralData({...generalData, description: e.target.value})}
                            className="border-[#3d6c58]/20 min-h-[100px]"
                            disabled={!isEditingGeneral}
                            style={{ 
                              backgroundColor: !isEditingGeneral ? '#f8fafc' : 'white',
                              borderRadius: 0 
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}
