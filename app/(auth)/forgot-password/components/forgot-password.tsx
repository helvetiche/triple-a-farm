"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const getResetErrorMessage = (error: any): string => {
  const code = error?.code;

  switch (code) {
    case "AUTH_FORGOT_PASSWORD_FAILED":
      return "No account found with this email address. Please check and try again.";
    case "INVALID_EMAIL":
      return "Please enter a valid email address.";
    case "TOO_MANY_ATTEMPTS_TRY_LATER":
      return "Too many password reset attempts. Please wait a few minutes before trying again.";
    case "NETWORK_ERROR":
      return "Network error. Please check your internet connection and try again.";
    case "USER_DISABLED":
      return "This account has been disabled. Please contact support.";
    default:
      return (
        error.message ||
        "Failed to send password reset email. Please try again."
      );
  }
};

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok || !result?.success) {
        const error = result?.error || {};
        const message = getResetErrorMessage(error);
        throw new Error(message);
      }

      toast.success(
        "Password reset email sent! Please check your inbox (and spam folder).",
        {
          duration: 6000,
        }
      );

      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error: any) {
      console.error("Password reset error:", error);
      const errorMessage = getResetErrorMessage(error);
      toast.error(errorMessage);
    }

    setIsLoading(false);
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
      onSubmit={handleSubmit}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Forgot your password?</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your email below to reset your password
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            className="border-[#A8D5BA] focus:border-[#3d6c58] focus:ring-[#3d6c58] transition-colors"
            required
            disabled={isLoading}
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className=" h-4 w-4 animate-spin" />}
          Send Reset Password Link
        </Button>
        <FieldDescription className="text-center">
          Already have an account?{" "}
          <a href="/login" className="underline underline-offset-4">
            Login
          </a>
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}
