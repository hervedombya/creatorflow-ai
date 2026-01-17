import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles, Mail, Lock, ArrowRight } from "lucide-react"
import Link from "next/link"
import { login, signup, signInWithGoogle } from "./actions"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const params = await searchParams
  const error = params?.error
  const message = params?.message

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-fuchsia-500 to-pink-500 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold">CreatorFlow AI</span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            Créez du contenu viral en quelques clics
          </h2>
          <p className="text-white/80 text-lg max-w-md">
            Rejoignez plus de 2,500 créateurs qui utilisent l'IA pour générer du contenu adapté à leur style unique.
          </p>
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-white/30 border-2 border-white/50" />
              <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/50" />
              <div className="w-8 h-8 rounded-full bg-white/10 border-2 border-white/50" />
            </div>
            <span>+2,500 créateurs actifs</span>
          </div>
        </div>

        <div className="relative z-10 text-white/50 text-sm">
          © 2025 CreatorFlow AI. Tous droits réservés.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50/50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
              CreatorFlow AI
            </span>
          </div>

          <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Connexion</h1>
            <p className="text-gray-500">Accédez à votre espace créateur</p>
          </div>

          {/* Error/Message Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {decodeURIComponent(error)}
            </div>
          )}
          {message && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
              {message}
            </div>
          )}

          <form className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Adresse email
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  required
                  className="pl-12 h-12 rounded-xl border-gray-200 bg-white focus-visible:ring-purple-500"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Mot de passe
                </Label>
                <Link href="#" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                  Mot de passe oublié?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="pl-12 h-12 rounded-xl border-gray-200 bg-white focus-visible:ring-purple-500"
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3">
              <Button
                formAction={login}
                size="lg"
                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg shadow-purple-200 transition-all"
              >
                Se connecter
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                formAction={signup}
                variant="outline"
                size="lg"
                className="h-12 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                S'inscrire
              </Button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-50/50 text-gray-500">ou</span>
            </div>
          </div>

          {/* Google OAuth */}
          <form action={signInWithGoogle}>
            <Button
              type="submit"
              variant="outline"
              size="lg"
              className="w-full h-12 rounded-xl border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continuer avec Google
            </Button>
          </form>

          {/* Back to home */}
          <p className="text-center text-sm text-gray-500 mt-8">
            <Link href="/" className="text-purple-600 hover:text-purple-700 font-semibold">
              ← Retour à l'accueil
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
