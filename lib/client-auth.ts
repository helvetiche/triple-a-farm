import { toast } from "sonner";

export interface UserData {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  emailVerified: boolean;
}

export const signUp = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<boolean> => {
  try {
    const response = await fetch("/api/auth/sign-up", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        firstName,
        lastName,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result?.success) {
      throw new Error(result?.error?.message || "Failed to create account.");
    }

    toast.success(
      "Account created successfully! Please check your email for verification link.",
      {
        duration: 6000,
      }
    );

    return true;
  } catch (error: any) {
    console.error("Sign up error:", error);
    toast.error(error.message || "Failed to create account. Please try again.");
    return false;
  }
};

export const signIn = async (
  email: string,
  password: string
): Promise<boolean> => {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (!response.ok || !result?.success) {
      throw new Error(result?.error?.message || "Failed to sign in.");
    }

    toast.success("Welcome back! Login successful.");
    return true;
  } catch (error: any) {
    console.error("Sign in error:", error);
    toast.error(error.message || "Failed to sign in. Please try again.");
    return false;
  }
};

export const logout = async (): Promise<void> => {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    const result = await response.json();

    if (!response.ok || !result?.success) {
      throw new Error(result?.error?.message || "Failed to logout.");
    }

    toast.success("Logged out successfully.");
  } catch (error: any) {
    console.error("Logout error:", error);
    toast.error("Failed to logout. Please try again.");
  }
};

export const getCurrentUserData = async (): Promise<{
  user: { uid: string; email: string | null } | null;
  profile: UserData | null;
}> => {
  try {
    const response = await fetch("/api/auth/me", {
      method: "GET",
      credentials: "include",
    });

    if (response.status === 401) {
      return { user: null, profile: null };
    }

    const result = await response.json();

    if (!response.ok || !result?.success) {
      throw new Error(result?.error?.message || "Failed to load user data.");
    }

    const data = result.data;

    return {
      user: {
        uid: data.uid,
        email: data.email,
      },
      profile: data.profile ?? null,
    };
  } catch (error: any) {
    console.error("Error getting user data:", error);
    return { user: null, profile: null };
  }
};
