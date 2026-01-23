export type ViewMode = "table" | "cards"

export interface RoosterSettings {
  viewMode: ViewMode
  itemsPerPage: number
  showImages: boolean
  sortBy: "id" | "breed" | "age" | "price"
  sortOrder: "asc" | "desc"
}

const DEFAULT_SETTINGS: RoosterSettings = {
  viewMode: "table",
  itemsPerPage: 10,
  showImages: true,
  sortBy: "id",
  sortOrder: "asc",
}

const SETTINGS_KEY = "triple-a-rooster-settings"

/**
 * Get user settings from localStorage
 */
export function getRoosterSettings(): RoosterSettings {
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS
  }

  try {
    const saved = localStorage.getItem(SETTINGS_KEY)
    if (!saved) {
      return DEFAULT_SETTINGS
    }

    const parsed = JSON.parse(saved)
    return { ...DEFAULT_SETTINGS, ...parsed }
  } catch (error) {
    console.warn("Failed to load rooster settings:", error)
    return DEFAULT_SETTINGS
  }
}

/**
 * Save user settings to localStorage
 */
export function saveRoosterSettings(settings: Partial<RoosterSettings>): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    const currentSettings = getRoosterSettings()
    const updatedSettings = { ...currentSettings, ...settings }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings))
  } catch (error) {
    console.warn("Failed to save rooster settings:", error)
  }
}

/**
 * Reset settings to default
 */
export function resetRoosterSettings(): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS))
  } catch (error) {
    console.warn("Failed to reset rooster settings:", error)
  }
}

/**
 * Get a specific setting value
 */
export function getSetting<K extends keyof RoosterSettings>(
  key: K
): RoosterSettings[K] {
  return getRoosterSettings()[key]
}

/**
 * Update a specific setting value
 */
export function updateSetting<K extends keyof RoosterSettings>(
  key: K,
  value: RoosterSettings[K]
): void {
  saveRoosterSettings({ [key]: value })
}
