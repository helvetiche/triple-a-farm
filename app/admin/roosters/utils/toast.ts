import { toast } from "sonner"

export interface ToastOptions {
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

// Success toasts
export const showSuccessToast = (message: string, options?: ToastOptions) => {
  return toast.success(message, {
    description: options?.description,
    action: options?.action,
    duration: 4000,
  })
}

// Error toasts
export const showErrorToast = (message: string, options?: ToastOptions) => {
  return toast.error(message, {
    description: options?.description,
    action: options?.action,
    duration: 6000,
  })
}

// Info toasts
export const showInfoToast = (message: string, options?: ToastOptions) => {
  return toast.info(message, {
    description: options?.description,
    action: options?.action,
    duration: 4000,
  })
}

// Loading toasts
export const showLoadingToast = (message: string, options?: ToastOptions) => {
  return toast.loading(message, {
    description: options?.description,
  })
}

// CRUD specific toasts
export const toastCRUD = {
  // Create operations
  createSuccess: (entity: string, name?: string) => 
    showSuccessToast(
      name ? `${entity} "${name}" created successfully` : `${entity} created successfully`,
      { description: "The new record has been added to your inventory." }
    ),
  
  createError: (entity: string, error?: string) => 
    showErrorToast(
      `Failed to create ${entity}`,
      { description: error || "Please check your input and try again." }
    ),

  // Read operations (generally not needed for success, but useful for errors)
  loadError: (entity: string) => 
    showErrorToast(
      `Failed to load ${entity}`,
      { description: "Please refresh the page and try again." }
    ),

  // Update operations
  updateSuccess: (entity: string, name?: string) => 
    showSuccessToast(
      name ? `${entity} "${name}" updated successfully` : `${entity} updated successfully`,
      { description: "Your changes have been saved." }
    ),
  
  updateError: (entity: string, error?: string) => 
    showErrorToast(
      `Failed to update ${entity}`,
      { description: error || "Please check your changes and try again." }
    ),

  // Delete operations
  deleteSuccess: (entity: string, name?: string) => 
    showSuccessToast(
      name ? `${entity} "${name}" deleted successfully` : `${entity} deleted successfully`,
      { description: "The record has been removed from your inventory." }
    ),
  
  deleteError: (entity: string, error?: string) => 
    showErrorToast(
      `Failed to delete ${entity}`,
      { description: error || "Please try again or contact support." }
    ),

  // Rooster specific toasts
  roosterAdded: (name: string) => 
    toastCRUD.createSuccess("Rooster", name),
  
  roosterUpdated: (name: string) => 
    toastCRUD.updateSuccess("Rooster", name),
  
  roosterDeleted: (name: string) => 
    toastCRUD.deleteSuccess("Rooster", name),
  
  roosterSold: (name: string, price: string) => 
    showSuccessToast(
      `Rooster "${name}" sold successfully`,
      { description: `Sale completed for ${price}.` }
    ),

  // Status changes
  statusChanged: (entity: string, name: string, status: string) => 
    showSuccessToast(
      `${entity} "${name}" status updated`,
      { description: `Status changed to ${status}.` }
    ),

  // Validation errors
  validationError: (field: string) => 
    showErrorToast(
      "Validation Error",
      { description: `Please check the ${field} field.` }
    ),

  // Network errors
  networkError: () => 
    showErrorToast(
      "Network Error",
      { description: "Please check your internet connection and try again." }
    ),

  // Permission errors
  permissionError: () => 
    showErrorToast(
      "Permission Denied",
      { description: "You don't have permission to perform this action." }
    ),
}
