"use client"

import { useState, useEffect } from "react"
import { Bell, Check, X, Package, PhilippinePeso, Star, AlertTriangle } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Notification {
  id: string
  type: "inventory" | "sales" | "feedback" | "health"
  title: string
  description: string
  time: string
  read: boolean
}

const iconMap = {
  inventory: Package,
  sales: PhilippinePeso,
  feedback: Star,
  health: AlertTriangle,
}

export function NotificationPanel() {
  const [notificationsList, setNotificationsList] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const unreadCount = notificationsList.filter(n => !n.read).length

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/notifications")
        const result = await response.json()
        
        if (result.success && result.data) {
          setNotificationsList(result.data.map((n: any) => ({
            ...n,
            read: false, // All notifications start as unread
          })))
        }
      } catch (error) {
        console.error("Error fetching notifications:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
    
    // Refresh notifications every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const markAsRead = (id: string) => {
    setNotificationsList(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotificationsList(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  const clearNotification = (id: string) => {
    setNotificationsList(prev => prev.filter(n => n.id !== id))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-[#3d6c58]">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[calc(100vw-1.5rem)] sm:w-[400px] p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[#1f3f2c]">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs h-7 px-2">
              Mark all as read
            </Button>
          )}
        </div>
        <Separator orientation="horizontal" className="mb-4" />
        <ScrollArea className="h-[300px] w-full pr-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Bell className="h-8 w-8 text-muted-foreground mb-2 animate-pulse" />
              <p className="text-sm text-muted-foreground">Loading notifications...</p>
            </div>
          ) : notificationsList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Bell className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notificationsList.map((notification) => {
                const Icon = iconMap[notification.type]
                return (
                  <div 
                    key={notification.id} 
                    className={`relative p-3 border ${!notification.read ? 'border-[#3d6c58]/50 bg-[#3d6c58]/5' : 'border-border bg-background'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-1.5 mt-0.5 ${!notification.read ? 'bg-[#3d6c58]/20' : 'bg-muted'} rounded-none`}>
                          <Icon className="h-3.5 w-3.5 text-[#3d6c58]" />
                        </div>
                        <div className="space-y-1 flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-[#1f3f2c] truncate">{notification.title}</h4>
                          <p className="text-xs text-muted-foreground">{notification.time}</p>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {notification.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => clearNotification(notification.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
