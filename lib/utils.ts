import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
/**
 * Retry a Firestore transaction with exponential backoff
 */
export async function retryTransaction<T>(
  transactionFn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 100
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await transactionFn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on non-retryable errors
      if (error instanceof Error) {
        const message = error.message.toLowerCase();
        if (message.includes('permission') || 
            message.includes('unauthenticated') || 
            message.includes('not found')) {
          throw error;
        }
      }
      
      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        break;
      }
      
      // Wait with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 100;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      console.warn(`Transaction attempt ${attempt + 1} failed, retrying in ${delay}ms:`, error);
    }
  }
  
  throw lastError!;
}

/**
 * Validate request body structure and types
 */
export function validateRequestBody<T>(
  body: unknown,
  requiredFields: (keyof T)[],
  optionalFields: (keyof T)[] = []
): { isValid: boolean; errors: string[]; data?: Partial<T> } {
  const errors: string[] = [];
  
  if (!body || typeof body !== 'object') {
    return { isValid: false, errors: ['Request body must be an object'] };
  }
  
  const data = body as Record<string, unknown>;
  const result: Partial<T> = {};
  
  // Check required fields
  for (const field of requiredFields) {
    const fieldName = String(field);
    if (!(fieldName in data) || data[fieldName] === undefined || data[fieldName] === null) {
      errors.push(`Missing required field: ${fieldName}`);
    } else {
      (result as any)[field] = data[fieldName];
    }
  }
  
  // Include optional fields if present
  for (const field of optionalFields) {
    const fieldName = String(field);
    if (fieldName in data && data[fieldName] !== undefined) {
      (result as any)[field] = data[fieldName];
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? result : undefined
  };
}

/**
 * Add timeout to any promise
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
    })
  ]);
}