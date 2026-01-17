'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Sparkles, ArrowRight, CheckCircle2, Loader2, ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

type Step = 'identity' | 'style' | 'goals' | 'complete'

export default function Onboarding() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState<Step>('identity')
  const [loading, setLoading] = useState(false)
  
  // Section 1: Identité
  const [fullName, setFullName] = useState('')
  const [niches, setNiches] = useState<string[]>([])
  const [subNiche, setSubNiche] = useState('')
  const [creatorType, setCreatorType] = useState('')

  // Section 2: Style & Ton
  const [tones, setTones] = useState<string[]>([])
  const [visualStyles, setVisualStyles] = useState<string[]>([])
  const [emojiFreq, setEmojiFreq] = useState('')

  // Section 3: Plateformes & Objectifs
  const [primaryPlatform, setPrimaryPlatform] = useState('')
  const [mainObjective, setMainObjective] = useState('')

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('onboarding_data')
    if (savedData) {
      const data = JSON.parse(savedData)
      if (data.fullName) setFullName(data.fullName)
      if (data.niches) setNiches(data.niches)
      if (data.subNiche) setSubNiche(data.subNiche)
      if (data.creatorType) setCreatorType(data.creatorType)
      if (data.tones) setTones(data.tones)
      if (data.visualStyles) setVisualStyles(data.visualStyles)
      if (data.emojiFreq) setEmojiFreq(data.emojiFreq)
      if (data.primaryPlatform) setPrimaryPlatform(data.primaryPlatform)
      if (data.mainObjective) setMainObjective(data.mainObjective)
      if (data.step) setStep(data.step)
    }
  }, [])

  // Save to localStorage whenever state changes
  useEffect(() => {
    const data = {
      step,
      fullName,
      niches,
      subNiche,
      creatorType,
      tones,
      visualStyles,
      emojiFreq,
      primaryPlatform,
      mainObjective
    }
    localStorage.setItem('onboarding_data', JSON.stringify(data))
  }, [step, fullName, niches, subNiche, creatorType, tones, visualStyles, emojiFreq, primaryPlatform, mainObjective])

  // Helper to toggle array state
  const toggleSelection = (item: string, current: string[], setter: React.Dispatch<React.SetStateAction<string[]>>, max = 3) => {
    setter(prev => {
      if (prev.includes(item)) return prev.filter(i => i !== item)
      if (prev.length >= max) return prev
      return [...prev, item]
    })
  }

  const handleComplete = async () => {
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("User not found")
      
      const styleProfile = {
         tone: tones.join(', '),
         vibe_keywords: visualStyles,
         writing_style: `Tone: ${tones.join('/')}, Emojis: ${emojiFreq}`,
         analyzed_from_samples: false,
         manual_input: true
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName,
          niche: niches.join(', '), 
          sub_niche: subNiche,
          creator_type: creatorType,
          content_tone: tones,
          visual_style: visualStyles,
          emoji_frequency: emojiFreq,
          primary_platforms: { [primaryPlatform]: 1 },
          main_objective: mainObjective,
          style_profile: styleProfile,
          is_onboarded: true
        })

      if (error) throw error

      // Clear local storage on success
      localStorage.removeItem('onboarding_data')

      setStep('complete')
      setTimeout(() => {
        router.push('/create')
        router.refresh()
      }, 2000)

    } catch (error: any) {
      console.error('Onboarding error:', error)
      toast.error('Erreur lors de la sauvegarde', {
        description: error.message || error.details || "Une erreur inconnue est survenue."
      })
    } finally {
      setLoading(false)
    }
  }

  // Progress calculation
  const getProgress = () => {
    switch(step) {
      case 'identity': return '33%'
      case 'style': return '66%'
      case 'goals': return '90%'
      default: return '100%'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 md:p-8">
      {/* Branding */}
      <div className="mb-8 flex items-center gap-2">
        <img src="/logo.png" alt="CreatorFlow Logo" className="w-10 h-10 object-contain" />
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
          CreatorFlow Profile
        </span>
      </div>

      <div className="w-full max-w-2xl bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
        {/* Progress Bar */}
        <div className="h-1 bg-gray-100">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: getProgress() }}
          />
        </div>

        <div className="p-6 md:p-8">
          {/* Step 1: Identity */}
          {step === 'identity' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Qui êtes-vous ?</h1>
                <p className="text-gray-500">Commençons par les bases de votre identité créateur.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Nom / Pseudo</Label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="@pseudo" />
                </div>

                <div className="space-y-3">
                  <Label>Niche Principale (Max 3)</Label>
                  <div className="flex flex-wrap gap-2">
                    {["Beauté", "Mode", "Fitness", "Food", "Voyage", "Gaming", "Business", "Tech", "Lifestyle", "Humour"].map((item) => (
                      <button
                        key={item}
                        onClick={() => toggleSelection(item, niches, setNiches, 3)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          niches.includes(item) ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Sous-niche / Spécialité</Label>
                  <Input value={subNiche} onChange={(e) => setSubNiche(e.target.value)} placeholder="Ex: Skincare coréen pour peaux sensibles" />
                </div>

                <div className="space-y-2">
                  <Label>Type de Créateur</Label>
                  <select 
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    value={creatorType}
                    onChange={(e) => setCreatorType(e.target.value)}
                  >
                    <option value="">Sélectionner...</option>
                    <option value="solo">Créateur Solo</option>
                    <option value="micro">Micro-influenceur (1k-10k)</option>
                    <option value="brand">Marque / Business</option>
                    <option value="ugc">Créateur UGC</option>
                  </select>
                </div>
              </div>

              <Button 
                onClick={() => setStep('style')}
                disabled={!fullName || niches.length === 0 || !creatorType}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white mt-4"
              >
                Suivant <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 2: Style */}
          {step === 'style' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Votre Style Unique</h1>
                <p className="text-gray-500">C'est ce qui rend votre contenu unique.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <Label>Ton de voix (Max 3)</Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "😄 Humoristique / Drôle",
                      "💼 Professionnel / Expert",
                      "💕 Inspirant / Motivant",
                      "😎 Décontracté / Amical",
                      "📚 Éducatif / Pédagogique",
                      "✨ Aspirationnel / Lifestyle",
                      "💪 Direct / Sans filtre",
                      "🌈 Positif / Optimiste",
                      "🤝 Authentique / Transparent",
                      "🎭 Théâtral / Dramatique"
                    ].map((item) => (
                      <button
                        key={item}
                        onClick={() => toggleSelection(item, tones, setTones, 3)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          tones.includes(item) ? "bg-pink-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Esthétique Visuelle (Max 3)</Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "⚪ Minimaliste / Épuré",
                      "🌈 Coloré / Vibrant",
                      "🖤 Sombre / Moody",
                      "☀️ Lumineux / Aéré",
                      "🎨 Artistique / Créatif",
                      "📸 Naturel / Authentique",
                      "✨ Glamour / Luxe",
                      "🏙️ Urbain / Streetwear",
                      "🌿 Nature / Organique",
                      "🔮 Futuriste / Tech"
                    ].map((item) => (
                      <button
                        key={item}
                        onClick={() => toggleSelection(item, visualStyles, setVisualStyles, 3)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          visualStyles.includes(item) ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Fréquence d'emojis</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {["Aucun", "Peu", "Moyen", "Beaucoup"].map((item) => (
                      <button
                        key={item}
                        onClick={() => setEmojiFreq(item)}
                        className={`py-2 rounded-lg text-sm font-medium transition-all border ${
                          emojiFreq === item ? "border-purple-500 bg-purple-50 text-purple-700" : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <Button variant="outline" onClick={() => setStep('identity')}>Retour</Button>
                <Button 
                  onClick={() => setStep('goals')}
                  disabled={tones.length === 0 || visualStyles.length === 0 || !emojiFreq}
                  className="flex-1 bg-purple-600 text-white"
                >
                  Suivant <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Goals */}
          {step === 'goals' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Objectifs & Plateformes</h1>
                <p className="text-gray-500">Où et pourquoi publiez-vous ?</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <Label>Plateforme Principale</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {["Instagram", "TikTok", "LinkedIn", "Facebook", "YouTube", "Snapchat"].map((item) => (
                      <button
                        key={item}
                        onClick={() => setPrimaryPlatform(item)}
                        className={`py-3 rounded-lg text-sm font-medium transition-all border ${
                          primaryPlatform === item ? "border-purple-500 bg-purple-50 text-purple-700 shadow-sm" : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Objectif Principal</Label>
                  <select 
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    value={mainObjective}
                    onChange={(e) => setMainObjective(e.target.value)}
                  >
                    <option value="">Sélectionner...</option>
                    <option value="growth">Croissance (Abonnés)</option>
                    <option value="sales">Vente / Conversion</option>
                    <option value="engagement">Engagement Communauté</option>
                    <option value="branding">Personal Branding</option>
                    <option value="education">Éducation</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <Button variant="outline" onClick={() => setStep('style')}>Retour</Button>
                <Button 
                  onClick={handleComplete}
                  disabled={!primaryPlatform || !mainObjective}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-200"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  Terminer
                </Button>
              </div>
            </div>
          )}

          {/* Complete State */}
          {step === 'complete' && (
             <div className="py-20 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-8 text-green-600 shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Profil configuré !</h2>
              <p className="text-gray-500 max-w-sm mb-8">
                Tout est prêt. Redirection vers l'espace de création...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
