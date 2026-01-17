import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/Header"
import { Sparkles, Play, Zap, Star, ArrowRight, ChevronRight, Instagram, Video, Type, Image as ImageIcon } from "lucide-react"
import Image from "next/image"

// Placeholder paths - will be replaced with actual images/videos
const inputProduct = "/demo/product.jpg"
const inputPerson = "/demo/person.jpg"
const heroPreview = "/demo/post-generated.jpg"
const storyVideo = "/demo/story-video.mp4"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-50 via-pink-50 to-white" />
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        
        {/* Floating icons */}
        <div className="absolute top-1/4 left-[15%] animate-bounce hidden lg:block" style={{ animationDuration: "3s" }}>
          <div className="p-3 rounded-xl bg-white shadow-lg">
            <Sparkles className="h-6 w-6 text-purple-600" />
          </div>
        </div>
        <div className="absolute top-1/3 right-[20%] animate-bounce hidden lg:block" style={{ animationDuration: "3s", animationDelay: "1s" }}>
          <div className="p-3 rounded-xl bg-white shadow-lg">
            <Zap className="h-6 w-6 text-pink-600" />
          </div>
        </div>
        <div className="absolute bottom-1/3 left-[20%] animate-bounce hidden lg:block" style={{ animationDuration: "3s", animationDelay: "2s" }}>
          <div className="p-3 rounded-xl bg-white shadow-lg">
            <Star className="h-6 w-6 text-purple-500" />
          </div>
        </div>

        <div className="container mx-auto px-4 py-20 w-full">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-600 text-sm font-medium mb-8">
              <Sparkles className="h-4 w-4" />
              <span>Propulsé par l'IA de dernière génération</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Transformez vos idées en{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-pink-600">contenu viral</span>{" "}
              en 30 secondes
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10">
              L'assistant IA qui génère du contenu multi-plateforme parfaitement 
              adapté à votre style. Instagram, TikTok, Snapchat, Facebook — un seul clic.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Button asChild size="lg" className="h-12 px-8 text-lg rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-200 hover:shadow-purple-300 transition-all group">
                <Link href="/create">
                  Créer mon premier contenu
                  <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8 text-lg rounded-full border-gray-200 text-gray-700 hover:bg-gray-50 gap-2">
                <Play className="h-4 w-4 fill-current" />
                Voir la démo
              </Button>
            </div>

            {/* Hero Image/Mockup - Workflow Demo */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-white">
                {/* Browser mockup header */}
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400/70" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
                    <div className="w-3 h-3 rounded-full bg-green-400/70" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-4 py-1 rounded-md bg-white text-xs text-gray-500">
                      creatorflow.ai/create
                    </div>
                  </div>
                </div>
                
                {/* App preview content - Full Workflow */}
                <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
                  <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-6 items-center">
                    
                    {/* Left: Inputs Section */}
                    <div className="space-y-4">
                      <div className="text-left">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-1.5 rounded-lg bg-purple-100">
                            <Type className="h-4 w-4 text-purple-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">Prompt</span>
                        </div>
                        <div className="p-3 rounded-lg bg-white border border-gray-200 text-left">
                          <p className="text-sm text-gray-700 leading-relaxed">
                            Créer du contenu pour mettre en avant le produit joint sur un thème de formule 1
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-left">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-1.5 rounded-lg bg-pink-100">
                            <ImageIcon className="h-4 w-4 text-pink-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">Images sources</span>
                        </div>
                        <div className="flex gap-3">
                          <div className="flex-1 aspect-[3/4] rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-gray-100 relative">
                            {/* Placeholder - will be replaced with actual image */}
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              Produit
                            </div>
                            {/* <Image src={inputProduct} alt="Produit Monster Energy" fill className="object-cover" /> */}
                          </div>
                          <div className="flex-1 aspect-[3/4] rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-gray-100 relative">
                            {/* Placeholder - will be replaced with actual image */}
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              Créateur
                            </div>
                            {/* <Image src={inputPerson} alt="Créateur" fill className="object-cover" /> */}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Center: Arrow/Process */}
                    <div className="hidden lg:flex flex-col items-center gap-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="h-px w-8 bg-gradient-to-r from-transparent to-purple-500/50" />
                        <div className="p-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg">
                          <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <div className="h-px w-8 bg-gradient-to-r from-purple-500/50 to-transparent" />
                      </div>
                      <span className="text-xs font-medium text-gray-500">Génération IA</span>
                      <ChevronRight className="h-5 w-5 text-purple-600 animate-pulse" />
                    </div>
                    
                    {/* Mobile: Arrow */}
                    <div className="lg:hidden flex items-center justify-center py-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg">
                          <Sparkles className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-xs font-medium text-gray-500">Génération IA</span>
                      </div>
                    </div>
                    
                    {/* Right: Output Section - Two formats */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-lg bg-green-100">
                          <Instagram className="h-4 w-4 text-pink-500" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">Contenu généré</span>
                      </div>
                      
                      <div className="flex gap-3">
                        {/* Post Instagram */}
                        <div className="flex-1 space-y-2">
                          <div className="relative rounded-xl overflow-hidden shadow-lg border border-gray-200">
                            <div className="w-full aspect-square bg-gray-100 relative">
                              {/* Placeholder - will be replaced with actual image */}
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                Post généré
                              </div>
                              {/* <Image src={heroPreview} alt="Post Instagram" fill className="object-cover" /> */}
                            </div>
                            <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm">
                              <span className="text-[10px] font-medium text-white">Post</span>
                            </div>
                          </div>
                          {/* Generated caption */}
                          <div className="p-2 rounded-lg bg-white border border-gray-200 text-left">
                            <p className="text-[10px] text-gray-700 leading-relaxed line-clamp-3">
                              🏎️ L'énergie des champions ! Quand Monster Energy rencontre la F1, ça donne une explosion de puissance !
                            </p>
                            <p className="text-[9px] text-purple-600 mt-1">
                              #MonsterEnergy #F1 #LandoNorris #Racing
                            </p>
                          </div>
                        </div>
                        
                        {/* Story Instagram */}
                        <div className="flex-1 space-y-2">
                          <div className="relative rounded-xl overflow-hidden shadow-lg border border-gray-200">
                            <div className="w-full aspect-[9/16] bg-gray-100 relative">
                              {/* Placeholder - will be replaced with actual video */}
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                Story vidéo
                              </div>
                              {/* <video 
                                src={storyVideo}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                              /> */}
                            </div>
                            <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm flex items-center gap-1">
                              <Video className="h-3 w-3 text-white" />
                              <span className="text-[10px] font-medium text-white">Story</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <div className="flex-1 h-9 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center gap-2">
                          <span className="text-xs font-medium text-white">Télécharger</span>
                        </div>
                        <div className="flex-1 h-9 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">Modifier</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-200/20 via-pink-200/20 to-purple-200/20 blur-3xl -z-10 rounded-3xl" />
            </div>

            {/* Social proof */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-300 to-pink-300 border-2 border-white"
                    />
                  ))}
                </div>
                <span>+2,500 créateurs</span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="ml-1">4.9/5 satisfaction</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
