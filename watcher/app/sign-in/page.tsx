"use client"

import { signIn, signUp, useSession } from "@/lib/auth-client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, Github, Loader2 } from "lucide-react"

export default function SignInPage() {
  const { data: session, isPending: sessionLoading } = useSession()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Redirect if already logged in
  useEffect(() => {
    if (session && !sessionLoading) {
      router.push("/dashboard")
    }
  }, [session, sessionLoading, router])

  if (session && !sessionLoading) {
    return null
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (isSignUp) {
        const result = await signUp.email({
          email,
          password,
          name: name || email.split("@")[0],
        })
        if (result.error) {
          setError(result.error.message || "Sign up failed. Please try again.")
        } else {
          router.push("/dashboard")
        }
      } else {
        const result = await signIn.email({
          email,
          password,
        })
        if (result.error) {
          setError(result.error.message || "Invalid email or password.")
        } else {
          router.push("/dashboard")
        }
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialSignIn = async (provider: "google" | "github") => {
    setIsLoading(true)
    setError(null)
    try {
      await signIn.social({
        provider,
        callbackURL: "/dashboard",
      })
    } catch {
      setError(`Failed to sign in with ${provider}. Please try again.`)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex w-full">
      {/* Left Side (Dark Navy) */}
      <div className="hidden lg:flex w-1/2 bg-[#0b1c30] flex-col justify-between p-12 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#4b41e1]/20 blur-[120px] pointer-events-none" />
        
        {/* Header */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3">
            <Eye className="w-6 h-6 text-[#4b41e1]" />
            <span className="text-2xl font-bold text-white">Watcher</span>
          </Link>
        </div>

        {/* Center Graphic / Text */}
        <div className="relative z-10 flex flex-col justify-center h-full max-w-md">
          <div className="text-white/20 font-bold text-5xl mb-8 tracking-tighter">
            Powerful Features
          </div>
          <div className="space-y-4">
            <div className="h-24 rounded-lg bg-[#131b2e] border border-white/5 opacity-50"></div>
            <div className="h-24 rounded-lg bg-[#131b2e] border border-white/5 opacity-50 w-5/6"></div>
            <div className="h-24 rounded-lg bg-[#131b2e] border border-white/5 opacity-50 w-4/6"></div>
          </div>
        </div>

        {/* Footer Quote */}
        <div className="relative z-10">
          <blockquote className="text-2xl text-white font-semibold leading-tight mb-4">
            "Vigilant intelligence for high-stakes engineering teams."
          </blockquote>
          <div className="flex items-center gap-2 text-[10px] tracking-widest text-[#7c839b] font-bold uppercase">
            <div className="w-2 h-2 rounded-full bg-[#4b41e1]"></div>
            AI Agent Active
          </div>
        </div>
      </div>

      {/* Right Side (White) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-[#0b1c30] mb-2 tracking-tight">
              {isSignUp ? "Create your account" : "Welcome back"}
            </h1>
            <p className="text-[#45464d] text-lg">
              {isSignUp
                ? "Start your 14-day professional trial today."
                : "Access your AI agent dashboard."}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-md bg-[#ffdad6] border border-[#ffdad6] text-[#93000a] text-sm font-medium">
              {error}
            </div>
          )}

          {/* Social buttons */}
          <div className="flex flex-col gap-4 mb-8">
            <button
              onClick={() => handleSocialSignIn("github")}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border border-[#c6c6cd] hover:bg-[#f8f9ff] text-[#0b1c30] font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Github className="w-4 h-4" />
              Sign in with GitHub
            </button>

            <button
              onClick={() => handleSocialSignIn("google")}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border border-[#c6c6cd] hover:bg-[#f8f9ff] text-[#0b1c30] font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </button>
          </div>

          <div className="relative mb-8 flex items-center">
            <div className="flex-grow border-t border-[#c6c6cd]"></div>
            <span className="flex-shrink-0 mx-4 text-[10px] uppercase tracking-widest font-bold text-[#76777d]">
              Or email
            </span>
            <div className="flex-grow border-t border-[#c6c6cd]"></div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-5">
            {isSignUp && (
              <div className="flex gap-4">
                <div className="flex-1">
                  <label htmlFor="name" className="block text-sm text-[#45464d] mb-1.5">
                    First Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Linus"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-md border border-[#c6c6cd] bg-white text-[#0b1c30] placeholder-[#76777d] focus:outline-none focus:border-[#4b41e1] transition-colors text-sm"
                    disabled={isLoading}
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="lastName" className="block text-sm text-[#45464d] mb-1.5">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    placeholder="Torvalds"
                    className="w-full px-3 py-2.5 rounded-md border border-[#c6c6cd] bg-white text-[#0b1c30] placeholder-[#76777d] focus:outline-none focus:border-[#4b41e1] transition-colors text-sm"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm text-[#45464d] mb-1.5">
                {isSignUp ? "Work Email" : "Email Address"}
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-md border border-[#c6c6cd] bg-white text-[#0b1c30] placeholder-[#76777d] focus:outline-none focus:border-[#4b41e1] transition-colors text-sm"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="password" className="block text-sm text-[#45464d]">
                  Password
                </label>
                {!isSignUp && (
                  <Link href="#" className="text-sm text-[#4b41e1] hover:underline">
                    Forgot?
                  </Link>
                )}
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-md border border-[#c6c6cd] bg-white text-[#0b1c30] placeholder-[#76777d] focus:outline-none focus:border-[#4b41e1] transition-colors text-sm"
                required
                minLength={8}
                disabled={isLoading}
              />
              {isSignUp && (
                <p className="mt-2 text-xs text-[#76777d]">
                  Must be at least 12 characters with a mix of symbols.
                </p>
              )}
            </div>

            {isSignUp && (
              <div className="flex items-start gap-2 mt-4">
                <input 
                  type="checkbox" 
                  id="terms" 
                  className="mt-1 border-[#c6c6cd] rounded text-[#4b41e1] focus:ring-[#4b41e1]" 
                />
                <label htmlFor="terms" className="text-sm text-[#45464d]">
                  I agree to the <a href="#" className="text-[#4b41e1] hover:underline">Terms of Service</a> and <a href="#" className="text-[#4b41e1] hover:underline">Privacy Policy</a>.
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 px-4 py-3 rounded-md bg-[#000000] text-white font-semibold text-sm hover:bg-[#1a1c1c] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSignUp ? "Create Account" : "Sign in to Watcher"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-[#45464d]">
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(null) }}
              className="text-[#4b41e1] font-medium hover:underline cursor-pointer"
            >
              {isSignUp ? "Log in" : "Request Access"}
            </button>
          </p>

          {/* Footer links */}
          <div className="mt-16 pt-6 border-t border-[#e5eeff] flex justify-center gap-8 text-[10px] tracking-widest text-[#76777d] font-bold uppercase">
            <a href="#" className="hover:text-[#0b1c30] flex items-center gap-1">
              <span className="text-[12px]">?</span> Help Center
            </a>
            <a href="#" className="hover:text-[#0b1c30] flex items-center gap-1">
              <span className="text-[12px]">⛨</span> Compliance
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}