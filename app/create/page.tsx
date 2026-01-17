import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Sparkles, Upload, Square, Smartphone, Video } from "lucide-react"
import Link from "next/link"

export default function Create() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
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
            <Link href="/create" className="text-purple-600">Créer</Link>
            <Link href="#" className="hover:text-gray-900">Calendrier</Link>
            <Link href="#" className="hover:text-gray-900">Bibliothèque</Link>
            <div className="w-px h-4 bg-gray-200" />
            <span>Connexion</span>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-full">Commencer</Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Link>

        <div className="space-y-2 mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Créer votre contenu</h1>
          <p className="text-gray-500">Décrivez votre vision, l'IA fait le reste</p>
        </div>

        {/* Step 1: Description */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Décrivez votre contenu</h2>
          <Textarea 
            placeholder="Ex: Une photo lifestyle de mon nouveau produit tech, ambiance moderne et minimaliste, couleurs douces..." 
            className="min-h-[120px] resize-none border-gray-200 focus-visible:ring-purple-500 bg-gray-50/50 text-base"
          />
          <div className="text-right mt-2 text-xs text-gray-400">0/500</div>
        </div>

        {/* Step 2: Reference Image */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-4">
             <h2 className="text-sm font-semibold text-gray-900">Image de référence</h2>
             <span className="text-sm text-gray-400 font-normal">(optionnel)</span>
          </div>
          
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-purple-300 hover:bg-purple-50/10 transition-colors">
            <Upload className="w-8 h-8 text-gray-400 mb-3" />
            <p className="text-sm font-medium text-gray-900">Glissez votre image ou cliquez pour choisir</p>
            <p className="text-xs text-gray-500 mt-1">JPG, PNG acceptés</p>
          </div>
        </div>

        {/* Step 3: Format */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-6">Format souhaité</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Format Card 1 - Active */}
            <div className="relative group cursor-pointer">
              <input type="radio" name="format" id="post" className="peer sr-only" defaultChecked />
              <div className="p-6 rounded-xl border-2 border-purple-500 bg-purple-50/30 flex flex-col items-center text-center peer-checked:border-purple-500 peer-checked:bg-purple-50 transition-all">
                <Square className="w-8 h-8 text-purple-600 mb-3" />
                <h3 className="font-semibold text-gray-900 text-sm">Post Carré</h3>
                <p className="text-xs text-gray-500 mt-1">1080x1080</p>
                <div className="flex gap-2 mt-4 justify-center">
                   <span className="px-2 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600">Instagram</span>
                   <span className="px-2 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600">Facebook</span>
                </div>
              </div>
            </div>

            {/* Format Card 2 */}
            <div className="relative group cursor-pointer">
              <input type="radio" name="format" id="story" className="peer sr-only" />
              <div className="p-6 rounded-xl border border-gray-200 hover:border-purple-200 hover:bg-gray-50 flex flex-col items-center text-center peer-checked:border-purple-500 peer-checked:bg-purple-50 transition-all">
                <Smartphone className="w-8 h-8 text-gray-400 mb-3 group-hover:text-purple-400" />
                <h3 className="font-medium text-gray-900 text-sm">Story</h3>
                <p className="text-xs text-gray-500 mt-1">1080x1920</p>
                <div className="flex gap-2 mt-4 justify-center">
                   <span className="px-2 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600">Instagram</span>
                   <span className="px-2 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600">Snapchat</span>
                </div>
              </div>
            </div>

            {/* Format Card 3 */}
            <div className="relative group cursor-pointer">
              <input type="radio" name="format" id="reel" className="peer sr-only" />
              <div className="p-6 rounded-xl border border-gray-200 hover:border-purple-200 hover:bg-gray-50 flex flex-col items-center text-center peer-checked:border-purple-500 peer-checked:bg-purple-50 transition-all">
                <Video className="w-8 h-8 text-gray-400 mb-3 group-hover:text-purple-400" />
                <h3 className="font-medium text-gray-900 text-sm">Reel / TikTok</h3>
                <p className="text-xs text-gray-500 mt-1">1080x1920</p>
                <div className="flex gap-2 mt-4 justify-center">
                   <span className="px-2 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600">Instagram</span>
                   <span className="px-2 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600">TikTok</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Platforms */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm mb-10">
          <h2 className="text-sm font-semibold text-gray-900 mb-6">Plateformes cibles</h2>
          <div className="flex flex-wrap gap-4">
             <div className="flex items-center space-x-2 border border-purple-200 bg-purple-50 rounded-lg px-4 py-3 cursor-pointer">
                <Checkbox id="instagram" defaultChecked className="border-purple-400 data-[state=checked]:bg-purple-600" />
                <Label htmlFor="instagram" className="text-sm font-medium text-purple-900 cursor-pointer">Instagram</Label>
             </div>
             
             <div className="flex items-center space-x-2 border border-gray-200 rounded-lg px-4 py-3 hover:bg-gray-50 cursor-pointer">
                <Checkbox id="tiktok" />
                <Label htmlFor="tiktok" className="text-sm font-medium text-gray-700 cursor-pointer">TikTok</Label>
             </div>

             <div className="flex items-center space-x-2 border border-gray-200 rounded-lg px-4 py-3 hover:bg-gray-50 cursor-pointer">
                <Checkbox id="snapchat" />
                <Label htmlFor="snapchat" className="text-sm font-medium text-gray-700 cursor-pointer">Snapchat</Label>
             </div>

             <div className="flex items-center space-x-2 border border-gray-200 rounded-lg px-4 py-3 hover:bg-gray-50 cursor-pointer">
                <Checkbox id="facebook" />
                <Label htmlFor="facebook" className="text-sm font-medium text-gray-700 cursor-pointer">Facebook</Label>
             </div>
          </div>
        </div>

        {/* Action Button */}
        <Button size="lg" className="w-full h-14 text-lg rounded-xl bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-200 text-white font-semibold transition-all mb-12">
           <Sparkles className="w-5 h-5 mr-2" />
           Générer mon contenu
        </Button>

      </main>
    </div>
  )
}
