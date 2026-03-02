import { useState, useEffect } from "react"
import { 
  getRoosterSettings, 
  saveRoosterSettings, 
  type RoosterSettings,
  type ViewMode 
} from "./settings"

/**
 * Custom hook for managing rooster settings with localStorage persistence
 */
export function useRoosterSettings() {
  const [settings, setSettings] = useState<RoosterSettings>({
    viewMode: "table",
    itemsPerPage: 10,
    showImages: true,
    sortBy: "id",
    sortOrder: "asc",
  })
  const [isLoading, setIsLoading] = useState(true)

  // Load settings on mount
  useEffect(() => {
    try {
      const savedSettings = getRoosterSettings()
      setSettings(savedSettings)
    } catch (error) {
      console.warn("Failed to load rooster settings:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Update a specific setting
  const updateSetting = <K extends keyof RoosterSettings>(
    key: K, 
    value: RoosterSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    saveRoosterSettings({ [key]: value })
  }

  // Update multiple settings
  const updateSettings = (newSettings: Partial<RoosterSettings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)
    saveRoosterSettings(newSettings)
  }

  // Reset to default settings
  const resetSettings = () => {
    const defaultSettings: RoosterSettings = {
      viewMode: "table",
      itemsPerPage: 10,
      showImages: true,
      sortBy: "id",
      sortOrder: "asc",
    }
    setSettings(defaultSettings)
    saveRoosterSettings(defaultSettings)
  }

  return {
    settings,
    isLoading,
    updateSetting,
    updateSettings,
    resetSettings,
    // Convenience getters
    viewMode: settings.viewMode,
    itemsPerPage: settings.itemsPerPage,
    showImages: settings.showImages,
    sortBy: settings.sortBy,
    sortOrder: settings.sortOrder,
    // Convenience setters
    setViewMode: (viewMode: ViewMode) => updateSetting("viewMode", viewMode),
    setItemsPerPage: (itemsPerPage: number) => updateSetting("itemsPerPage", itemsPerPage),
    setShowImages: (showImages: boolean) => updateSetting("showImages", showImages),
    setSortBy: (sortBy: RoosterSettings["sortBy"]) => updateSetting("sortBy", sortBy),
    setSortOrder: (sortOrder: RoosterSettings["sortOrder"]) => updateSetting("sortOrder", sortOrder),
  }
}
