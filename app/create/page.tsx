'use client'

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Header } from "@/components/Header"
import { InstagramIcon, TikTokIcon, SnapchatIcon, FacebookIcon } from "@/components/icons/SocialIcons"
import { ArrowLeft, Sparkles, Upload, Square, Smartphone, Video, X, Loader2, Image as ImageIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

type Platform = 'instagram' | 'tiktok' | 'snapchat' | 'facebook'
type Format = 'post' | 'story' | 'reel'

export default function Create() {
  // Form state
  const [description, setDescription] = useState('')
  const [format, setFormat] = useState<Format>('post')
  const [platforms, setPlatforms] = useState<Platform[]>(['instagram'])
  
  // Image state
  const [referenceImage, setReferenceImage] = useState<File | null>(null)
  const [referencePreview, setReferencePreview] = useState<string | null>(null)
  const [productImage, setProductImage] = useState<File | null>(null)
  const [productPreview, setProductPreview] = useState<string | null>(null)
  
  // UI state
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Refs for file inputs
  const referenceInputRef = useRef<HTMLInputElement>(null)
  const productInputRef = useRef<HTMLInputElement>(null)

  // Handle file selection
  const handleFileSelect = (
    file: File | null, 
    setImage: (f: File | null) => void, 
    setPreview: (s: string | null) => void
  ) => {
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const removeImage = (
    setImage: (f: File | null) => void, 
    setPreview: (s: string | null) => void
  ) => {
    setImage(null)
    setPreview(null)
  }

  // Toggle platform selection
  const togglePlatform = (platform: Platform) => {
    setPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    )
  }

  // Check if form is valid
  const isValid = description.trim().length > 0 && referenceImage !== null && platforms.length > 0

  // Submit handler
  const handleSubmit = async () => {
    if (!isValid) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      // For MVP: just log the data (backend integration comes next)
      console.log('Submitting:', {
        description,
        format,
        platforms,
        referenceImage: referenceImage?.name,
        productImage: productImage?.name
      })
      
      // TODO: Upload images to Supabase Storage
      // TODO: Call backend API
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      alert('Génération lancée ! (Backend non connecté pour le moment)')
    } catch (err) {
      setError('Une erreur est survenue. Réessayez.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-6 md:py-12">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 md:mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Link>

        <div className="space-y-2 mb-8 md:mb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Créer votre contenu</h1>
          <p className="text-gray-500">Décrivez votre vision, l'IA fait le reste</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Description */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Décrivez votre contenu</h2>
          <Textarea 
            placeholder="Ex: Une photo lifestyle de mon nouveau produit tech, ambiance moderne et minimaliste, couleurs douces..." 
            className="min-h-[120px] resize-none border-gray-200 focus-visible:ring-purple-500 bg-gray-50/50 text-base"
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 500))}
          />
          <div className="text-right mt-2 text-xs text-gray-400">{description.length}/500</div>
        </div>

        {/* Step 2: Reference Image (Required) */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-4">
             <h2 className="text-sm font-semibold text-gray-900">Image de référence</h2>
             <span className="text-xs text-red-500 font-medium">*obligatoire</span>
          </div>
          <p className="text-sm text-gray-500 mb-4">Votre style visuel de référence (mood, couleurs, esthétique)</p>
          
          <input
            ref={referenceInputRef}
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files?.[0] || null, setReferenceImage, setReferencePreview)}
          />
          
          {referencePreview ? (
            <div className="relative rounded-xl overflow-hidden border border-purple-200">
              <Image src={referencePreview} alt="Reference" width={400} height={300} className="w-full h-48 object-cover" />
              <button 
                onClick={() => removeImage(setReferenceImage, setReferencePreview)}
                className="absolute top-3 right-3 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div 
              onClick={() => referenceInputRef.current?.click()}
              className="border-2 border-dashed border-purple-300 bg-purple-50/30 rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-colors"
            >
              <Upload className="w-8 h-8 text-purple-500 mb-3" />
              <p className="text-sm font-medium text-gray-900">Glissez votre image ou cliquez pour choisir</p>
              <p className="text-xs text-gray-500 mt-1">JPG, PNG acceptés</p>
            </div>
          )}
        </div>

        {/* Step 3: Product Image (Optional) */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-4">
             <h2 className="text-sm font-semibold text-gray-900">Image du produit</h2>
             <span className="text-sm text-gray-400 font-normal">(optionnel)</span>
          </div>
          <p className="text-sm text-gray-500 mb-4">Photo du produit à mettre en avant dans le contenu</p>
          
          <input
            ref={productInputRef}
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files?.[0] || null, setProductImage, setProductPreview)}
          />
          
          {productPreview ? (
            <div className="relative rounded-xl overflow-hidden border border-gray-200">
              <Image src={productPreview} alt="Product" width={400} height={300} className="w-full h-48 object-cover" />
              <button 
                onClick={() => removeImage(setProductImage, setProductPreview)}
                className="absolute top-3 right-3 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div 
              onClick={() => productInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-purple-300 hover:bg-purple-50/10 transition-colors"
            >
              <ImageIcon className="w-8 h-8 text-gray-400 mb-3" />
              <p className="text-sm font-medium text-gray-900">Glissez votre image ou cliquez pour choisir</p>
              <p className="text-xs text-gray-500 mt-1">JPG, PNG acceptés</p>
            </div>
          )}
        </div>

        {/* Step 4: Format */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-6">Format souhaité</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Format Card 1 - Post */}
            <label className="relative group cursor-pointer">
              <input 
                type="radio" 
                name="format" 
                value="post"
                checked={format === 'post'}
                onChange={() => setFormat('post')}
                className="peer sr-only" 
              />
              <div className="p-6 rounded-xl border-2 border-gray-200 hover:border-purple-200 flex flex-col items-center text-center peer-checked:border-purple-500 peer-checked:bg-purple-50 transition-all">
                <Square className="w-8 h-8 text-gray-400 peer-checked:text-purple-600 mb-3 group-hover:text-purple-400" />
                <h3 className="font-semibold text-gray-900 text-sm">Post Carré</h3>
                <p className="text-xs text-gray-500 mt-1">1080x1080</p>
                <div className="flex gap-2 mt-4 justify-center">
                   <span className="px-2 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600">Instagram</span>
                   <span className="px-2 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600">Facebook</span>
                </div>
              </div>
            </label>

            {/* Format Card 2 - Story */}
            <label className="relative group cursor-pointer">
              <input 
                type="radio" 
                name="format" 
                value="story"
                checked={format === 'story'}
                onChange={() => setFormat('story')}
                className="peer sr-only" 
              />
              <div className="p-6 rounded-xl border-2 border-gray-200 hover:border-purple-200 flex flex-col items-center text-center peer-checked:border-purple-500 peer-checked:bg-purple-50 transition-all">
                <Smartphone className="w-8 h-8 text-gray-400 mb-3 group-hover:text-purple-400" />
                <h3 className="font-medium text-gray-900 text-sm">Story</h3>
                <p className="text-xs text-gray-500 mt-1">1080x1920</p>
                <div className="flex gap-2 mt-4 justify-center">
                   <span className="px-2 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600">Instagram</span>
                   <span className="px-2 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600">Snapchat</span>
                </div>
              </div>
            </label>

            {/* Format Card 3 - Reel */}
            <label className="relative group cursor-pointer">
              <input 
                type="radio" 
                name="format" 
                value="reel"
                checked={format === 'reel'}
                onChange={() => setFormat('reel')}
                className="peer sr-only" 
              />
              <div className="p-6 rounded-xl border-2 border-gray-200 hover:border-purple-200 flex flex-col items-center text-center peer-checked:border-purple-500 peer-checked:bg-purple-50 transition-all">
                <Video className="w-8 h-8 text-gray-400 mb-3 group-hover:text-purple-400" />
                <h3 className="font-medium text-gray-900 text-sm">Reel / TikTok</h3>
                <p className="text-xs text-gray-500 mt-1">1080x1920</p>
                <div className="flex gap-2 mt-4 justify-center">
                   <span className="px-2 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600">Instagram</span>
                   <span className="px-2 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600">TikTok</span>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Step 5: Platforms */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm mb-10">
          <h2 className="text-sm font-semibold text-gray-900 mb-6">Plateformes cibles</h2>
          <div className="flex flex-wrap gap-4">
             <div 
               onClick={() => togglePlatform('instagram')}
               className={`flex items-center space-x-2 border rounded-lg px-4 py-3 cursor-pointer transition-colors ${
                 platforms.includes('instagram') 
                   ? 'border-purple-200 bg-purple-50' 
                   : 'border-gray-200 hover:bg-gray-50'
               }`}
             >
                <Checkbox 
                  id="instagram" 
                  checked={platforms.includes('instagram')}
                  onCheckedChange={() => togglePlatform('instagram')}
                  className="border-purple-400 data-[state=checked]:bg-purple-600" 
                />
                <InstagramIcon className="w-5 h-5 text-pink-600" />
                <Label htmlFor="instagram" className={`text-sm font-medium cursor-pointer ${platforms.includes('instagram') ? 'text-purple-900' : 'text-gray-700'}`}>Instagram</Label>
             </div>
             
             <div 
               onClick={() => togglePlatform('tiktok')}
               className={`flex items-center space-x-2 border rounded-lg px-4 py-3 cursor-pointer transition-colors ${
                 platforms.includes('tiktok') 
                   ? 'border-purple-200 bg-purple-50' 
                   : 'border-gray-200 hover:bg-gray-50'
               }`}
             >
                <Checkbox 
                  id="tiktok" 
                  checked={platforms.includes('tiktok')}
                  onCheckedChange={() => togglePlatform('tiktok')}
                />
                <TikTokIcon className="w-5 h-5 text-gray-900" />
                <Label htmlFor="tiktok" className="text-sm font-medium text-gray-700 cursor-pointer">TikTok</Label>
             </div>

             <div 
               onClick={() => togglePlatform('snapchat')}
               className={`flex items-center space-x-2 border rounded-lg px-4 py-3 cursor-pointer transition-colors ${
                 platforms.includes('snapchat') 
                   ? 'border-purple-200 bg-purple-50' 
                   : 'border-gray-200 hover:bg-gray-50'
               }`}
             >
                <Checkbox 
                  id="snapchat" 
                  checked={platforms.includes('snapchat')}
                  onCheckedChange={() => togglePlatform('snapchat')}
                />
                <SnapchatIcon className="w-5 h-5 text-yellow-400" />
                <Label htmlFor="snapchat" className="text-sm font-medium text-gray-700 cursor-pointer">Snapchat</Label>
             </div>

             <div 
               onClick={() => togglePlatform('facebook')}
               className={`flex items-center space-x-2 border rounded-lg px-4 py-3 cursor-pointer transition-colors ${
                 platforms.includes('facebook') 
                   ? 'border-purple-200 bg-purple-50' 
                   : 'border-gray-200 hover:bg-gray-50'
               }`}
             >
                <Checkbox 
                  id="facebook" 
                  checked={platforms.includes('facebook')}
                  onCheckedChange={() => togglePlatform('facebook')}
                />
                <FacebookIcon className="w-5 h-5 text-blue-600" />
                <Label htmlFor="facebook" className="text-sm font-medium text-gray-700 cursor-pointer">Facebook</Label>
             </div>
          </div>
        </div>

        {/* Action Button */}
        <Button 
          size="lg" 
          disabled={!isValid || isLoading}
          onClick={handleSubmit}
          className="w-full h-14 text-lg rounded-xl bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-200 text-white font-semibold transition-all mb-12 disabled:opacity-50 disabled:cursor-not-allowed"
        >
           {isLoading ? (
             <>
               <Loader2 className="w-5 h-5 mr-2 animate-spin" />
               Génération en cours...
             </>
           ) : (
             <>
               <Sparkles className="w-5 h-5 mr-2" />
               Générer mon contenu
             </>
           )}
        </Button>

      </main>
    </div>
  )
}
