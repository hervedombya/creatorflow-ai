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
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

// When deploying to Vercel, relative path works for internal API routes
const BACKEND_URL = '' // Empty string means same origin (relative path)

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
  const [loadingStep, setLoadingStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [masterPrompt, setMasterPrompt] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)
  
  const loadingSteps = [
    { label: 'Analyse de votre profil créateur', duration: 1000 },
    { label: 'Génération du prompt optimal par l\'IA', duration: 3000 },
    { label: 'Création de votre visuel personnalisé', duration: 5000 },
    { label: 'Finalisation...', duration: 1000 }
  ]
  
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
    setLoadingStep(0)
    setError(null)
    
    try {
      // Simulate progress through steps
      const progressInterval = setInterval(() => {
        setLoadingStep(prev => {
          if (prev < loadingSteps.length - 1) return prev + 1
          return prev
        })
      }, 2000)

      // 1. Fetch User Profile for context
      setLoadingStep(0)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // 2. Prepare Payload
      setLoadingStep(1)
      const payload = {
        user_text: description,
        tone: profile?.content_tone || [],
        visual_style: profile?.visual_style || [],
        niche: profile?.niche || "",
        sub_niche: profile?.sub_niche || "",
        creator_type: profile?.creator_type || "",
        image_description: `Format: ${format}, Platforms: ${platforms.join(', ')}` 
      }

      // 3. Call Backend (Next.js API Route)
      setLoadingStep(2)
      const response = await fetch(`${BACKEND_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Generation failed')
      }

      const data = await response.json()
      
      clearInterval(progressInterval)
      setLoadingStep(3)
      
      // Small delay to show final step
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 4. Success
      toast.success('Contenu généré avec succès !', {
        description: 'Votre image a été créée.'
      })
      
      setResultImage(data.image_url)
      setMasterPrompt(data.master_prompt)
      setShowResults(true)

    } catch (err: any) {
      console.error(err)
      toast.error('Une erreur est survenue', {
        description: err.message
      })
      setError(err.message)
    } finally {
      setIsLoading(false)
      setLoadingStep(0)
    }
  }

  const resetForm = () => {
    setShowResults(false)
    setResultImage(null)
    setMasterPrompt(null)
    setDescription('')
    setReferenceImage(null)
    setReferencePreview(null)
    setProductImage(null)
    setProductPreview(null)
  }

  const downloadImage = async () => {
    if (!resultImage) return
    
    try {
      const response = await fetch(resultImage)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `creatorflow-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('Image téléchargée !', {
        description: 'Le fichier a été sauvegardé.'
      })
    } catch (err) {
      toast.error('Erreur de téléchargement', {
        description: 'Impossible de télécharger l\'image.'
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 md:p-10 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mb-4 animate-pulse">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Création en cours...</h3>
              <p className="text-sm text-gray-500">Notre IA travaille sur votre contenu viral</p>
            </div>

            {/* Progress Steps */}
            <div className="space-y-4 mb-6">
              {loadingSteps.map((step, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                    index < loadingStep 
                      ? 'bg-green-500 text-white' 
                      : index === loadingStep 
                      ? 'bg-purple-500 text-white animate-pulse' 
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    {index < loadingStep ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-xs font-bold">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p className={`text-sm font-medium transition-colors duration-300 ${
                      index <= loadingStep ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </p>
                  </div>
                  {index === loadingStep && (
                    <Loader2 className="w-5 h-5 text-purple-600 animate-spin flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden mb-6">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
              />
            </div>

            {/* Estimated Time */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                ⏱️ Temps estimé : {Math.max(10 - loadingStep * 3, 3)}-{Math.max(15 - loadingStep * 4, 5)} secondes
              </p>
            </div>

            {/* Cancel Button */}
            <button
              onClick={() => {
                setIsLoading(false)
                setLoadingStep(0)
                toast.info('Génération annulée')
              }}
              className="mt-6 w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      <main className="max-w-3xl mx-auto px-4 py-6 md:py-12">
        {/* Result Display */}
        {showResults && resultImage ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

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

        {/* Result Display */}
        {showResults && resultImage && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Success Banner */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 md:p-8 text-white text-center shadow-xl">
              <div className="inline-flex items-center justify-center p-3 bg-white/20 rounded-full mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Contenu Généré !</h2>
              <p className="text-purple-100">Votre visuel est prêt à être partagé sur vos réseaux</p>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
              {/* Image Preview */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Aperçu</h3>
                <div className="relative aspect-square w-full bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                  <Image 
                    src={resultImage} 
                    alt="Generated Content" 
                    fill 
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>

              {/* Master Prompt Section */}
              {masterPrompt && (
                <div className="mb-8 p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                    <Sparkles className="w-4 h-4 mr-2 text-purple-600" />
                    Prompt généré par l'IA
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{masterPrompt}</p>
                </div>
              )}

              {/* Platform-Specific Captions */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Légendes suggérées</h3>
                <div className="space-y-4">
                  {platforms.map((platform) => (
                    <div key={platform} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        {platform === 'instagram' && <InstagramIcon className="w-5 h-5 text-pink-600" />}
                        {platform === 'tiktok' && <TikTokIcon className="w-5 h-5 text-gray-900" />}
                        {platform === 'snapchat' && <SnapchatIcon className="w-5 h-5 text-yellow-400" />}
                        {platform === 'facebook' && <FacebookIcon className="w-5 h-5 text-blue-600" />}
                        <span className="font-medium text-gray-900 capitalize">{platform}</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {description.slice(0, 100)}...
                        <span className="block mt-2 text-purple-600">#CreatorFlow #{platform} #ContentCreation</span>
                      </p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-2 text-xs h-7"
                        onClick={() => {
                          navigator.clipboard.writeText(description)
                          toast.success('Copié !')
                        }}
                      >
                        Copier
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info Box */}
              <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm mb-1">Format : {format === 'post' ? 'Post Carré' : format === 'story' ? 'Story' : 'Reel/TikTok'}</h4>
                    <p className="text-xs text-gray-600">
                      Dimension : {format === 'post' ? '1080x1080' : '1080x1920'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 h-12"
                  onClick={resetForm}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Générer un nouveau contenu
                </Button>
                <Button 
                  className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  onClick={downloadImage}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Télécharger l'image
                </Button>
              </div>
            </div>

            {/* Tips Section */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 md:p-8 border border-purple-100">
              <h3 className="font-semibold text-gray-900 mb-4">💡 Conseils pour maximiser l'engagement</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Publiez aux heures de forte affluence (18h-21h)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Utilisez 5-10 hashtags pertinents pour votre niche</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Engagez avec votre audience dans les premiers 30 minutes</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Adaptez le texte selon la plateforme cible</span>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <>
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
            {/* All form sections go here - they were already present */}
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

            {/* Step 2: Reference Image */}
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

            {/* Step 3: Product Image */}
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
                  </div>
                </label>

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
                  </div>
                </label>

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
          </>
        )}

      </main>
    </div>
  )
}
