import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, Play, Star } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
            CreatorFlow AI
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <Link href="/login" className="hover:text-purple-600 transition-colors">Connexion</Link>
          <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6">
            <Link href="/create">Commencer</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center text-center px-4 pt-20 pb-16 max-w-5xl mx-auto">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-600 text-xs font-medium mb-8 border border-purple-100">
          <Sparkles className="w-3 h-3" />
          Propulsé par l'IA de dernière génération
        </div>

        {/* Heading */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6 leading-tight">
          Transformez vos idées en <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500">
            contenu viral
          </span>{" "}
          en 30 secondes
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          L'assistant IA qui génère du contenu multi-plateforme parfaitement adapté à 
          votre style. Instagram, TikTok, Snapchat, Facebook — un seul clic.
        </p>

        {/* CTA Buttons */}
        <div className="flex items-center gap-4 mb-20">
          <Button asChild size="lg" className="h-12 px-8 text-lg rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-200 hover:shadow-purple-300 transition-all">
            <Link href="/create">
              Créer mon premier contenu →
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="h-12 px-8 text-lg rounded-full border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900">
            <Play className="w-4 h-4 mr-2 fill-current" />
            Voir la démo
          </Button>
        </div>

        {/* Mockup Container */}
        <div className="relative w-full max-w-4xl mx-auto">
          {/* Floating Elements */}
          <div className="absolute -left-12 top-1/4 animate-bounce duration-[3000ms]">
            <div className="bg-white p-3 rounded-2xl shadow-xl shadow-purple-100 border border-purple-50">
               <Sparkles className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <div className="absolute -right-8 bottom-1/3 animate-bounce duration-[4000ms] delay-700">
             <div className="bg-white p-3 rounded-2xl shadow-xl shadow-pink-100 border border-pink-50">
               <div className="text-pink-500 font-bold">⚡</div>
            </div>
          </div>

          {/* Main Interface Mockup */}
          <div className="relative rounded-2xl border border-gray-200 bg-white/50 backdrop-blur-xl shadow-2xl overflow-hidden p-2">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-pink-500/10 pointer-events-none" />
            
            {/* Window Controls */}
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-gray-100 bg-white/80">
              <div className="w-3 h-3 rounded-full bg-red-400/80" />
              <div className="w-3 h-3 rounded-full bg-amber-400/80" />
              <div className="w-3 h-3 rounded-full bg-green-400/80" />
              <div className="ml-auto text-[10px] text-gray-400 font-medium">creatorflow.ai/create</div>
            </div>

            {/* Content Area */}
            <div className="flex bg-white h-[500px]">
               {/* Skeleton Sidebar */}
               <div className="w-16 border-r border-gray-100 p-4 space-y-4">
                  <div className="w-8 h-8 rounded-lg bg-gray-100" />
                  <div className="w-8 h-8 rounded-lg bg-gray-50" />
                  <div className="w-8 h-8 rounded-lg bg-gray-50" />
               </div>
               
               {/* Skeleton Main */}
               <div className="flex-1 p-8 flex gap-8">
                  <div className="flex-1 space-y-4">
                    <div className="h-8 bg-gray-100 rounded-full w-1/3" />
                    <div className="h-32 bg-gray-50 rounded-2xl w-full" />
                    <div className="flex gap-4">
                      <div className="h-24 bg-gray-50 rounded-2xl flex-1" />
                      <div className="h-24 bg-gray-50 rounded-2xl flex-1" />
                      <div className="h-24 bg-gray-50 rounded-2xl flex-1" />
                    </div>
                  </div>
                  
                  {/* Right Panel Highlight */}
                  <div className="w-1/3 bg-purple-100/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-br from-purple-200/40 to-pink-200/40" />
                     <Sparkles className="w-12 h-12 text-purple-400 relative z-10 animate-pulse" />
                  </div>
               </div>
            </div>
            
            {/* Bottom Bar */}
            <div className="h-16 border-t border-gray-100 bg-white flex items-center justify-between px-6">
               <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-purple-200 border-2 border-white" />
                    <div className="w-6 h-6 rounded-full bg-pink-200 border-2 border-white" />
                    <div className="w-6 h-6 rounded-full bg-blue-200 border-2 border-white" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium">+2,500 créateurs</span>
               </div>
               <div className="flex gap-1 text-amber-400 text-xs">
                 ★★★★★ <span className="text-gray-400 ml-1">4.9/5 satisfaction</span>
               </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
