'use client'
import Image from "next/image"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { SignupForm } from "@/app/(auth)/sign-up/components/signup-form"

export default function SignupPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-1 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
                  <Link href="/" className="flex items-center gap-2 font-medium">
                    <div className="flex size-6 items-center justify-center">
                      <Image 
                          src="/images/logo-png.png" 
                          alt="Triple A Gamefarm Logo" 
                          width={32}
                          height={32}
                          className="h-8 w-8 object-contain"
                          />
                    </div>
                    Triple A Gamefarm
                  </Link>
                </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <div className="mb-4">
              <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-green-600 transition-colors duration-200">
                <ChevronLeft className="h-4 w-4" />
                Back to main page
              </Link>
            </div>
            <SignupForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/images/bg.png"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-green-100/30"></div>
      </div>
    </div>
  )
}
