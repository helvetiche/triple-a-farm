"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signUp } from "@/lib/client-auth";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // Client-side validation
    if (!firstName.trim()) {
      toast.error("Please enter your first name.");
      setIsLoading(false);
      return;
    }

    if (!lastName.trim()) {
      toast.error("Please enter your last name.");
      setIsLoading(false);
      return;
    }

    if (!email.trim()) {
      toast.error("Please enter your email address.");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match. Please check and try again.");
      setIsLoading(false);
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    const success = await signUp(email, password, firstName, lastName);

    if (success) {
      // Redirect to verification page or login
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }

    setIsLoading(false);
  };

  return (
    <form
      className={cn("flex flex-col gap-3", className)}
      {...props}
      onSubmit={handleSubmit}
    >
      <FieldGroup>
        <div className="flex flex-col items-center text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Fill in the form below to create your account
          </p>
        </div>
        <Field className="gap-2">
          <FieldLabel htmlFor="firstName">First Name</FieldLabel>
          <Input
            id="firstName"
            name="firstName"
            type="text"
            placeholder="Juan"
            className="border-[#A8D5BA] focus:border-[#3d6c58] focus:ring-[#3d6c58] transition-colors"
            required
            disabled={isLoading}
          />
        </Field>
        <Field className="gap-2">
          <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
          <Input
            id="lastName"
            name="lastName"
            type="text"
            placeholder="Dela Cruz"
            className="border-[#A8D5BA] focus:border-[#3d6c58] focus:ring-[#3d6c58] transition-colors"
            required
            disabled={isLoading}
          />
        </Field>
        <Field className="gap-2">
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
        </Field>
        <Field className="gap-2">
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            className="border-[#A8D5BA] focus:border-[#3d6c58] focus:ring-[#3d6c58] transition-colors"
            required
            disabled={isLoading}
            minLength={8}
          />
          <FieldDescription>
            Must be at least 8 characters long.
          </FieldDescription>
        </Field>
        <Field className="gap-2">
          <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            className="border-[#A8D5BA] focus:border-[#3d6c58] focus:ring-[#3d6c58] transition-colors"
            required
            disabled={isLoading}
            minLength={8}
          />
          <FieldDescription>Please confirm your password.</FieldDescription>
        </Field>
        <Field>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className=" h-4 w-4 animate-spin" />}
            Create Account
          </Button>
        </Field>
        <Field>
          <FieldDescription className="px-6 text-center">
            Already have an account? <a href="/login">Sign in</a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
