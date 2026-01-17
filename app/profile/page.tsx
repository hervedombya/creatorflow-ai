'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles, Save, Loader2, Share2, User } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Header } from "@/components/Header"

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Form State
  const [fullName, setFullName] = useState('')
  const [niches, setNiches] = useState<string[]>([])
  const [subNiche, setSubNiche] = useState('')
  const [creatorType, setCreatorType] = useState('')
  
  const [tones, setTones] = useState<string[]>([])
  const [visualStyles, setVisualStyles] = useState<string[]>([])
  const [emojiFreq, setEmojiFreq] = useState('')
  
  const [primaryPlatform, setPrimaryPlatform] = useState('')
  const [mainObjective, setMainObjective] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setFullName(profile.full_name || '')
        setNiches(profile.niche ? profile.niche.split(', ') : [])
        setSubNiche(profile.sub_niche || '')
        setCreatorType(profile.creator_type || '')
        setTones(profile.content_tone || [])
        setVisualStyles(profile.visual_style || [])
        setEmojiFreq(profile.emoji_frequency || '')
        
        if (profile.primary_platforms) {
          const platforms = Object.keys(profile.primary_platforms)
          if (platforms.length > 0) setPrimaryPlatform(platforms[0])
        }
        
        setMainObjective(profile.main_objective || '')
      }
      setLoading(false)
    }

    fetchProfile()
  }, [])

  const toggleSelection = (item: string, current: string[], setter: React.Dispatch<React.SetStateAction<string[]>>, max = 3) => {
    setter(prev => {
      if (prev.includes(item)) return prev.filter(i => i !== item)
      if (prev.length >= max) return prev
      return [...prev, item]
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("User not found")

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          niche: niches.join(', '), 
          sub_niche: subNiche,
          creator_type: creatorType,
          content_tone: tones,
          visual_style: visualStyles,
          emoji_frequency: emojiFreq,
          primary_platforms: primaryPlatform ? { [primaryPlatform]: 1 } : {},
          main_objective: mainObjective,
        })
        .eq('id', user.id)

      if (error) throw error

      alert("Profil mis à jour avec succès !")
      router.refresh()
    } catch (error: any) {
      console.error('Error saving profile:', error)
      alert(`Erreur: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mon Profil Créateur</h1>
              <p className="text-gray-500 mt-1">Gérez vos préférences pour une IA plus pertinente.</p>
            </div>
            <Button onClick={handleSave} disabled={saving} className="bg-purple-600 hover:bg-purple-700">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Sauvegarder
            </Button>
          </div>

          {/* Identity Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
               <User className="w-5 h-5 text-purple-600" />
               <h2 className="text-lg font-semibold text-gray-900">Identité</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Nom / Pseudo</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="space-y-2">
                 <Label>Sous-niche</Label>
                 <Input value={subNiche} onChange={(e) => setSubNiche(e.target.value)} placeholder="Ex: Skincare coréen" />
              </div>
              <div className="space-y-2 md:col-span-2">
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
               <div className="space-y-2 md:col-span-2">
                <Label>Niches (Max 3)</Label>
                <div className="flex flex-wrap gap-2">
                  {["Beauté", "Mode", "Fitness", "Food", "Voyage", "Gaming", "Business", "Tech", "Lifestyle", "Humour"].map((item) => (
                    <button
                      key={item}
                      onClick={() => toggleSelection(item, niches, setNiches, 3)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        niches.includes(item) ? "bg-purple-100 text-purple-700 border border-purple-200" : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Style Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
               <Sparkles className="w-5 h-5 text-pink-500" />
               <h2 className="text-lg font-semibold text-gray-900">Style & Ton</h2>
            </div>
            
             <div className="space-y-4">
               <div className="space-y-2">
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
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      tones.includes(item) ? "bg-pink-100 text-pink-700 border border-pink-200" : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              </div>

              <div className="space-y-2">
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
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      visualStyles.includes(item) ? "bg-blue-100 text-blue-700 border border-blue-200" : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              </div>
              
               <div className="space-y-2">
                <Label>Fréquence d'emojis</Label>
                <div className="flex gap-2">
                  {["Aucun", "Peu", "Moyen", "Beaucoup"].map((item) => (
                    <button
                      key={item}
                      onClick={() => setEmojiFreq(item)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                        emojiFreq === item ? "border-purple-500 bg-purple-50 text-purple-700" : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
             </div>
          </div>

          {/* Goals Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
             <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
               <Share2 className="w-5 h-5 text-blue-500" />
               <h2 className="text-lg font-semibold text-gray-900">Objectifs</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <Label>Plateforme Principale</Label>
                  <div className="flex flex-wrap gap-2">
                      {["Instagram", "TikTok", "LinkedIn", "Facebook", "YouTube"].map((item) => (
                        <button
                          key={item}
                          onClick={() => setPrimaryPlatform(item)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                            primaryPlatform === item ? "border-purple-500 bg-purple-50 text-purple-700" : "border-gray-200 hover:bg-gray-50"
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
          </div>

        </div>
      </div>
    </div>
  )
}
