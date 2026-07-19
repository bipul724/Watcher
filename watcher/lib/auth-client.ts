import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" 
    ? window.location.origin 
    : (process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000")
})

export const { 
  signIn, 
  signOut, 
  signUp, 
  useSession,
  $Infer 
} = authClient

// Type-safe session
export type Session = typeof $Infer.Session.session