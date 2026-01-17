'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, LogOut, User } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export function Header() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="px-6 py-4 flex items-center justify-between bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
          <Sparkles className="w-5 h-5 fill-current" />
        </div>
        <Link href="/" className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
          CreatorFlow AI
        </Link>
      </div>

      <div className="flex items-center gap-6 text-sm font-medium text-gray-500">
        {user && (
          <>
            <Link href="/create" className="text-purple-600 hover:text-purple-700">Créer</Link>
            <Link href="#" className="hover:text-gray-900">Calendrier</Link>
            <Link href="#" className="hover:text-gray-900">Bibliothèque</Link>
            <div className="w-px h-4 bg-gray-200" />
          </>
        )}
        
        {loading ? (
          <div className="w-20 h-8 bg-gray-100 rounded-full animate-pulse" />
        ) : user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-gray-700 max-w-[120px] truncate">
                {user.email?.split('@')[0]}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-600"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <>
            <Link href="/login" className="hover:text-purple-600 transition-colors">Connexion</Link>
            <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white rounded-full">
              <Link href="/login">Commencer</Link>
            </Button>
          </>
        )}
      </div>
    </header>
  )
}
