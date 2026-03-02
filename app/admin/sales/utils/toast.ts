// Toast notification utilities for sales operations

import { toast } from "sonner";

export const toastCRUD = {
  createSuccess: (item: string) => {
    toast.success(`${item} created successfully`)
  },
  
  createError: (item: string, error?: string) => {
    toast.error(`Failed to create ${item}${error ? `: ${error}` : ""}`)
  },
  
  updateSuccess: (item: string) => {
    toast.success(`${item} updated successfully`)
  },
  
  updateError: (item: string, error?: string) => {
    toast.error(`Failed to update ${item}${error ? `: ${error}` : ""}`)
  },
  
  deleteSuccess: (item: string) => {
    toast.success(`${item} deleted successfully`)
  },
  
  deleteError: (item: string, error?: string) => {
    toast.error(`Failed to delete ${item}${error ? `: ${error}` : ""}`)
  },
  
  itemUpdated: (message: string) => {
    toast.success(message)
  },
  
  confirmationSent: (customer: string) => {
    toast.success(`Confirmation sent to ${customer}`)
  },
  
  validationError: (message: string) => {
    toast.error(message)
  }
}
