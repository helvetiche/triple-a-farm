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
import { signIn, getCurrentUserData } from "@/lib/client-auth";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function LoginForm({
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
    const password = formData.get("password") as string;

    // Client-side validation
    if (!email.trim()) {
      toast.error("Please enter your email address.");
      setIsLoading(false);
      return;
    }

    if (!password.trim()) {
      toast.error("Please enter your password.");
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

    const success = await signIn(email, password);

    if (success) {
      // Verify the session is established before redirecting
      const { user } = await getCurrentUserData();
      if (user) {
        router.push("/admin");
        router.refresh();
      } else {
        toast.error("Login successful but session not established. Please try again.");
      }
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
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your email below to login to your account
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
        <div className="flex flex-col gap-2">
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            required
            className="border-[#A8D5BA] focus:border-[#3d6c58] focus:ring-[#3d6c58] transition-colors"
            disabled={isLoading}
          />
        </div>
        <a
          href="/forgot-password"
          className="ml-auto text-sm underline-offset-4 hover:underline"
        >
          Forgot your password?
        </a>
        <div className="flex flex-col gap-3">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className=" h-4 w-4 animate-spin" />}
            Login
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
