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
import { Key, Shield, AlertTriangle, Edit3, Save, X } from "lucide-react"
import { toast } from "sonner"
import {
  SettingsNavSkeleton,
  SettingsPageHeaderSkeleton,
  PasswordSettingsSkeleton,
  SecurityTipsSkeleton
} from "../components/skeleton-loading"

export const description = "Password Settings - Triple A Gamefarm"

export default function PasswordSettingsPage() {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  const [isEditingPassword, setIsEditingPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const handlePasswordSave = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
    toast.success("Password changed successfully")
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    })
    setIsEditingPassword(false)
  }

  const handlePasswordCancel = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    })
    setIsEditingPassword(false)
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
                  {/* Password Settings Card */}
                  {isLoading ? (
                    <PasswordSettingsSkeleton />
                  ) : (
                    <Card className="border-[#3d6c58]/20" style={{ borderRadius: 0 }}>
                      <CardHeader style={{ borderRadius: 0 }}>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <CardTitle className="flex items-center gap-2 text-[#1f3f2c]">
                              <Key className="h-5 w-5" />
                              Password & Security
                            </CardTitle>
                            <CardDescription>
                              Change your password to keep your account secure
                            </CardDescription>
                          </div>
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-2">
                            {isEditingPassword && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePasswordCancel}
                                className="flex items-center gap-2 border-[#3d6c58]/20 w-full sm:w-auto"
                              >
                                <X className="h-4 w-4" />
                                Cancel
                              </Button>
                            )}
                            <Button
                              variant={isEditingPassword ? "default" : "outline"}
                              size="sm"
                              onClick={isEditingPassword ? handlePasswordSave : () => setIsEditingPassword(true)}
                              className={`flex items-center gap-2 w-full sm:w-auto ${isEditingPassword ? "bg-[#3d6c58] hover:bg-[#4e816b]" : "border-[#3d6c58]/20"}`}
                            >
                              {isEditingPassword ? (
                                <>
                                  <Save className="h-4 w-4" />
                                  Change Password
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
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword" className="text-[#3d6c58]">Current Password</Label>
                          <Input
                            id="currentPassword"
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                            className="border-[#3d6c58]/20"
                            placeholder="Enter current password"
                            disabled={!isEditingPassword}
                            style={{ 
                              backgroundColor: !isEditingPassword ? '#f8fafc' : 'white',
                              borderRadius: 0 
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newPassword" className="text-[#3d6c58]">New Password</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                            className="border-[#3d6c58]/20"
                            placeholder="Enter new password"
                            disabled={!isEditingPassword}
                            style={{ 
                              backgroundColor: !isEditingPassword ? '#f8fafc' : 'white',
                              borderRadius: 0 
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword" className="text-[#3d6c58]">Confirm New Password</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                            className="border-[#3d6c58]/20"
                            placeholder="Confirm new password"
                            disabled={!isEditingPassword}
                            style={{ 
                              backgroundColor: !isEditingPassword ? '#f8fafc' : 'white',
                              borderRadius: 0 
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Security Tips Card */}
                  {isLoading ? (
                    <SecurityTipsSkeleton />
                  ) : (
                    <Card className="border-[#3d6c58]/20" style={{ borderRadius: 0 }}>
                      <CardHeader style={{ borderRadius: 0 }}>
                        <CardTitle className="flex items-center gap-2 text-[#1f3f2c]">
                          <Shield className="h-5 w-5" />
                          Security Tips
                        </CardTitle>
                        <CardDescription>
                          Keep your account secure
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4" style={{ borderRadius: 0 }}>
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="text-sm font-medium text-[#1f3f2c]">Use a Strong Password</h4>
                            <p className="text-xs text-[#4a6741]">Create a unique password that you don't use elsewhere</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="text-sm font-medium text-[#1f3f2c]">Regular Updates</h4>
                            <p className="text-xs text-[#4a6741]">Change your password every 3-6 months</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="text-sm font-medium text-[#1f3f2c]">Two-Factor Authentication</h4>
                            <p className="text-xs text-[#4a6741]">Enable 2FA for an extra layer of security</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="text-sm font-medium text-[#1f3f2c]">Beware of Phishing</h4>
                            <p className="text-xs text-[#4a6741]">Never share your password via email or messages</p>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-[#3d6c58]/20">
                          <Button variant="outline" size="sm" className="w-full border-[#3d6c58]/20">
                            Enable Two-Factor Authentication
                          </Button>
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
