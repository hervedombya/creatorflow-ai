'use client'

import { useState, useEffect } from 'react'
import { Header } from "@/components/Header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Clock,
  Image as ImageIcon,
  Sparkles,
  X
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import Image from "next/image"

type ScheduledPost = {
  id: string
  user_id: string
  content_id?: string
  scheduled_date: string
  scheduled_time: string
  platform: string
  format: string
  title?: string
  notes?: string
  image_url?: string
  created_at: string
}

type DayData = {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  posts: ScheduledPost[]
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [postToDelete, setPostToDelete] = useState<string | null>(null)
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Form state
  const [formData, setFormData] = useState({
    scheduled_date: '',
    scheduled_time: '09:00',
    platform: 'instagram',
    format: 'post',
    title: '',
    notes: '',
    content_id: ''
  })

  useEffect(() => {
    loadScheduledPosts()
  }, [currentDate])

  const loadScheduledPosts = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsLoading(false)
        return
      }

      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59)

      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*, generated_content(image_url)')
        .eq('user_id', user.id)
        .gte('scheduled_date', startOfMonth.toISOString().split('T')[0])
        .lte('scheduled_date', endOfMonth.toISOString().split('T')[0])
        .order('scheduled_date', { ascending: true })
        .order('scheduled_time', { ascending: true })

      if (error) throw error

      const posts = (data || []).map((post: any) => ({
        ...post,
        image_url: post.generated_content?.image_url || post.image_url
      }))

      setScheduledPosts(posts)
    } catch (error: any) {
      console.error('Error loading posts:', error)
      toast.error('Erreur lors du chargement', {
        description: error.message
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getDaysInMonth = (): DayData[] => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days: DayData[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Add previous month's trailing days
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i)
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        posts: []
      })
    }

    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateStr = date.toISOString().split('T')[0]
      const postsForDay = scheduledPosts.filter(
        post => post.scheduled_date === dateStr
      )
      
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.getTime() === today.getTime(),
        posts: postsForDay
      })
    }

    // Add next month's leading days to fill the grid
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day)
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        posts: []
      })
    }

    return days
  }

  const handleDateClick = (date: Date) => {
    if (!date) return
    setSelectedDate(date)
    const dateStr = date.toISOString().split('T')[0]
    setFormData(prev => ({ ...prev, scheduled_date: dateStr }))
    setIsDialogOpen(true)
  }

  const handleSavePost = async () => {
    if (!formData.scheduled_date) {
      toast.error('Veuillez sélectionner une date')
      return
    }

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('scheduled_posts')
        .insert({
          user_id: user.id,
          scheduled_date: formData.scheduled_date,
          scheduled_time: formData.scheduled_time,
          platform: formData.platform,
          format: formData.format,
          title: formData.title || null,
          notes: formData.notes || null,
          content_id: formData.content_id || null
        })

      if (error) throw error

      toast.success('Post planifié avec succès !')
      setIsDialogOpen(false)
      setFormData({
        scheduled_date: '',
        scheduled_time: '09:00',
        platform: 'instagram',
        format: 'post',
        title: '',
        notes: '',
        content_id: ''
      })
      loadScheduledPosts()
    } catch (error: any) {
      toast.error('Erreur lors de la planification', {
        description: error.message
      })
    }
  }

  const handleDeletePost = async (id: string) => {
    setPostToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeletePost = async () => {
    if (!postToDelete) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('scheduled_posts')
        .delete()
        .eq('id', postToDelete)

      if (error) throw error

      toast.success('Post supprimé avec succès')
      setIsDeleteDialogOpen(false)
      setPostToDelete(null)
      loadScheduledPosts()
    } catch (error: any) {
      toast.error('Erreur lors de la suppression', {
        description: error.message
      })
    }
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ]

  const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
  const days = getDaysInMonth()

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-6 md:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendrier de Publication</h1>
            <p className="text-gray-500">Planifiez vos contenus à l'avance</p>
          </div>
          <div className="flex gap-3">
            <Link href="/create">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                <Sparkles className="w-4 h-4 mr-2" />
                Nouveau contenu
              </Button>
            </Link>
            <Button variant="outline" onClick={goToToday}>
              Aujourd'hui
            </Button>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h2 className="text-2xl font-bold text-gray-900 min-w-[200px] text-center">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <Button variant="ghost" size="icon" onClick={goToNextMonth}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Week day headers */}
            {weekDays.map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-gray-500 py-2">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {days.map((dayData, index) => {
              const dateStr = dayData.date.toISOString().split('T')[0]
              const isSelected = selectedDate?.toISOString().split('T')[0] === dateStr
              
              return (
                <div
                  key={index}
                  onClick={() => handleDateClick(dayData.date)}
                  className={`min-h-[100px] border rounded-lg p-2 cursor-pointer transition-all hover:bg-gray-50 ${
                    !dayData.isCurrentMonth 
                      ? 'bg-gray-50 opacity-50' 
                      : 'bg-white'
                  } ${
                    dayData.isToday 
                      ? 'border-purple-500 border-2 bg-purple-50' 
                      : 'border-gray-200'
                  } ${
                    isSelected 
                      ? 'ring-2 ring-purple-500' 
                      : ''
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    dayData.isToday 
                      ? 'text-purple-600' 
                      : dayData.isCurrentMonth 
                      ? 'text-gray-900' 
                      : 'text-gray-400'
                  }`}>
                    {dayData.date.getDate()}
                  </div>
                  
                  {/* Posts for this day */}
                  <div className="space-y-1">
                    {dayData.posts.slice(0, 2).map((post) => (
                      <div
                        key={post.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedDate(dayData.date)
                          setFormData({
                            scheduled_date: post.scheduled_date,
                            scheduled_time: post.scheduled_time,
                            platform: post.platform,
                            format: post.format,
                            title: post.title || '',
                            notes: post.notes || '',
                            content_id: post.content_id || ''
                          })
                          setIsDialogOpen(true)
                        }}
                        className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded truncate hover:bg-purple-200 flex items-center justify-between group"
                      >
                        <span className="flex items-center gap-1 truncate">
                          <Clock className="w-3 h-3" />
                          {post.scheduled_time.slice(0, 5)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeletePost(post.id)
                          }}
                          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {dayData.posts.length > 2 && (
                      <div className="text-xs text-gray-500 px-2">
                        +{dayData.posts.length - 2} autres
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Scheduled Posts List */}
        {scheduledPosts.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Posts planifiés ce mois</h3>
            <div className="space-y-3">
              {scheduledPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  {post.image_url && (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={post.image_url}
                        alt="Post"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {post.title || 'Post sans titre'}
                      </span>
                      <Badge variant="secondary">{post.platform}</Badge>
                      <Badge variant="outline">{post.format}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        {new Date(post.scheduled_date).toLocaleDateString('fr-FR')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {post.scheduled_time.slice(0, 5)}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePost(post.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Schedule Post Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Planifier un post</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <Label htmlFor="time">Heure</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.scheduled_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduled_time: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="platform">Plateforme</Label>
                <select
                  id="platform"
                  value={formData.platform}
                  onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="snapchat">Snapchat</option>
                  <option value="facebook">Facebook</option>
                </select>
              </div>
              <div>
                <Label htmlFor="format">Format</Label>
                <select
                  id="format"
                  value={formData.format}
                  onChange={(e) => setFormData(prev => ({ ...prev, format: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="post">Post</option>
                  <option value="story">Story</option>
                  <option value="reel">Reel</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="title">Titre (optionnel)</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Titre du post"
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Notes, hashtags, rappels..."
                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSavePost} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
              Planifier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le post planifié ?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Cette action est irréversible. Le post sera définitivement supprimé.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsDeleteDialogOpen(false)
              setPostToDelete(null)
            }}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeletePost}
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
