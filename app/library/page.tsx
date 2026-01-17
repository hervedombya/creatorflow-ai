'use client'

import { useState, useEffect } from 'react'
import { Header } from "@/components/Header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Grid3x3, 
  List, 
  Download, 
  Trash2, 
  Image as ImageIcon,
  Filter,
  Calendar,
  Sparkles,
  Loader2
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

type GeneratedContent = {
  id: string
  user_id: string
  image_url: string
  master_prompt: string
  user_text: string
  format: string
  platforms: string[]
  created_at: string
}

type ViewMode = 'grid' | 'list'

export default function Library() {
  const [contents, setContents] = useState<GeneratedContent[]>([])
  const [filteredContents, setFilteredContents] = useState<GeneratedContent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedContent, setSelectedContent] = useState<GeneratedContent | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [contentToDelete, setContentToDelete] = useState<string | null>(null)

  useEffect(() => {
    loadContents()
  }, [])

  useEffect(() => {
    filterContents()
  }, [searchQuery, contents])

  const loadContents = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('generated_content')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setContents(data || [])
      setFilteredContents(data || [])
    } catch (error: any) {
      console.error('Error loading contents:', error)
      toast.error('Erreur lors du chargement', {
        description: error.message
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterContents = () => {
    if (!searchQuery.trim()) {
      setFilteredContents(contents)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = contents.filter(content => 
      content.user_text?.toLowerCase().includes(query) ||
      content.master_prompt?.toLowerCase().includes(query) ||
      content.format?.toLowerCase().includes(query) ||
      content.platforms?.some(p => p.toLowerCase().includes(query))
    )
    setFilteredContents(filtered)
  }

  const handleDelete = (id: string) => {
    setContentToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!contentToDelete) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('generated_content')
        .delete()
        .eq('id', contentToDelete)

      if (error) throw error

      toast.success('Contenu supprimé avec succès')
      setIsDeleteDialogOpen(false)
      setContentToDelete(null)
      loadContents()
    } catch (error: any) {
      toast.error('Erreur lors de la suppression', {
        description: error.message
      })
    }
  }

  const handleDownload = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename || `creatorflow-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('Image téléchargée !')
    } catch (error) {
      toast.error('Erreur lors du téléchargement')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-6 md:py-12">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Ma Bibliothèque</h1>
              <p className="text-gray-500">
                {filteredContents.length} {filteredContents.length === 1 ? 'contenu généré' : 'contenus générés'}
              </p>
            </div>
            <Link href="/create">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                <Sparkles className="w-4 h-4 mr-2" />
                Nouveau contenu
              </Button>
            </Link>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Rechercher par description, prompt, format..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="flex items-center gap-2"
              >
                <Grid3x3 className="w-4 h-4" />
                Grille
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="flex items-center gap-2"
              >
                <List className="w-4 h-4" />
                Liste
              </Button>
            </div>
          </div>
        </div>

        {/* Content Grid/List */}
        {filteredContents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? 'Aucun résultat trouvé' : 'Aucun contenu généré'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery 
                ? 'Essayez avec d\'autres mots-clés'
                : 'Commencez par créer votre premier contenu'}
            </p>
            {!searchQuery && (
              <Link href="/create">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Créer mon premier contenu
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            {filteredContents.map((content) => (
              <div
                key={content.id}
                className={`bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all ${
                  viewMode === 'list' ? 'flex gap-4 p-4' : ''
                }`}
              >
                {/* Image */}
                <div 
                  className={`relative cursor-pointer group ${
                    viewMode === 'list' 
                      ? 'w-32 h-32 flex-shrink-0' 
                      : 'aspect-square'
                  }`}
                  onClick={() => {
                    setSelectedContent(content)
                    setIsDialogOpen(true)
                  }}
                >
                  <Image
                    src={content.image_url}
                    alt="Generated content"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>

                {/* Content Info */}
                <div className={`flex-1 ${viewMode === 'list' ? 'p-0' : 'p-4'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate mb-1">
                        {content.user_text?.slice(0, 50) || 'Sans description'}...
                      </p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {content.platforms?.map((platform) => (
                          <Badge key={platform} variant="secondary" className="text-xs">
                            {platform}
                          </Badge>
                        ))}
                        {content.format && (
                          <Badge variant="outline" className="text-xs">
                            {content.format}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {formatDate(content.created_at)}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedContent(content)
                        setIsDialogOpen(true)
                      }}
                      className="flex-1 text-xs"
                    >
                      Voir
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(content.image_url, `creatorflow-${content.id}.png`)}
                      className="text-xs"
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(content.id)}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Preview Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails du contenu</DialogTitle>
          </DialogHeader>
          {selectedContent && (
            <div className="space-y-6">
              {/* Image */}
              <div className="relative aspect-square w-full bg-gray-100 rounded-xl overflow-hidden">
                <Image
                  src={selectedContent.image_url}
                  alt="Generated content"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-sm text-gray-700">{selectedContent.user_text}</p>
                </div>

                {selectedContent.master_prompt && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Prompt généré</h3>
                    <p className="text-sm text-gray-700 bg-purple-50 p-3 rounded-lg">
                      {selectedContent.master_prompt}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Format</h3>
                    <Badge>{selectedContent.format || 'N/A'}</Badge>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Plateformes</h3>
                    <div className="flex flex-wrap gap-1">
                      {selectedContent.platforms?.map((platform) => (
                        <Badge key={platform} variant="secondary">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => handleDownload(selectedContent.image_url, `creatorflow-${selectedContent.id}.png`)}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDelete(selectedContent.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer ce contenu ?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Cette action est irréversible. Le contenu sera définitivement supprimé de votre bibliothèque.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsDeleteDialogOpen(false)
              setContentToDelete(null)
            }}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
