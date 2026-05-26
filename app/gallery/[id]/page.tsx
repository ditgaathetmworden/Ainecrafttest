'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
const SkinViewer3D = dynamic(() => import('@/components/editor/skin-viewer-3d').then(mod => mod.SkinViewer3D), { ssr: false })
import { BottomNav } from '@/components/layout/bottom-nav'
import { getMockSkinById, getCommentsBySkinId, formatNumber, formatTimeAgo } from '@/lib/mock-data'
import { downloadSkinPNG } from '@/lib/skin-utils'
import { ChevronLeft, Download, Edit, Heart, Share2, User, MessageCircle, Send } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SkinDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [newComment, setNewComment] = useState('')
  const [showComments, setShowComments] = useState(false)

  const skin = getMockSkinById(params.id as string)
  const comments = skin ? getCommentsBySkinId(skin.id) : []

  // Initialize like count from skin data
  useState(() => {
    if (skin) setLikeCount(skin.likes)
  })

  if (!skin) {
    return (
      <div className="flex min-h-[100dvh] flex-col bg-background pb-16">
        <header className="shrink-0 border-b border-border bg-obsidian-surface/95 backdrop-blur-lg">
          <div className="flex h-11 items-center px-3">
            <button
              onClick={() => router.back()}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-obsidian-elevated hover:text-foreground"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>
        </header>
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-medium text-foreground">Skin not found</p>
            <p className="mt-1 text-sm text-muted-foreground">This skin may have been removed</p>
            <Link 
              href="/gallery" 
              className="mt-4 inline-block text-sm text-neon hover:underline"
            >
              Back to Gallery
            </Link>
          </div>
        </main>
        <BottomNav />
      </div>
    )
  }

  const handleDownload = () => {
    downloadSkinPNG(skin.imageUrl, skin.name)
  }

  const handleEditSkin = () => {
    sessionStorage.setItem('editSkinUrl', skin.imageUrl)
    router.push('/editor')
  }

  const handleLike = () => {
    setLiked(!liked)
    setLikeCount(prev => liked ? prev - 1 : prev + 1)
  }

  const handleSubmitComment = () => {
    if (!newComment.trim()) return
    // In real app: send to API
    console.log('New comment:', newComment)
    setNewComment('')
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background pb-16">
      {/* Header */}
      <header className="shrink-0 border-b border-border bg-obsidian-surface/95 backdrop-blur-lg">
        <div className="flex h-11 items-center justify-between px-3">
          <button
            onClick={() => router.back()}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-obsidian-elevated hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <h1 className="text-xs font-bold tracking-wide">
            <span className="text-neon">Skin</span>
            <span className="text-foreground"> Details</span>
          </h1>
          
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-obsidian-elevated hover:text-foreground">
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto">
          {/* 3D Viewer */}
          <section 
            className="relative h-[320px] bg-[#0a0a0a] overflow-hidden"
          >
            <Image
              src="/minecraft-background.jpg"
              alt="Background"
              fill
              className="object-cover opacity-50"
              referrerPolicy="no-referrer"
            />
            <SkinViewer3D
              skinUrl={skin.imageUrl}
              className="relative h-full w-full z-10"
              animation="walk"
              autoRotate={false}
              showControls={true}
            />
          </section>

          {/* Skin Info */}
          <section className="px-5 py-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground">{skin.name}</h2>
              <Link
                href={`/profile/${skin.authorId}`}
                className="mt-1 inline-block text-sm font-semibold text-neon hover:text-neon/80"
              >
                @{skin.authorName}
              </Link>
              {skin.description && (
                <p className="mt-3 text-sm text-foreground/70 leading-relaxed">{skin.description}</p>
              )}
            </div>

            {/* Stats */}
            <div className="mb-8 flex items-center gap-6">
              <div className="flex items-center gap-1.5 text-sm text-foreground/60">
                <Heart className="h-4 w-4" />
                <span className="font-medium text-foreground">{formatNumber(likeCount || skin.likes)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-foreground/60">
                <Download className="h-4 w-4" />
                <span className="font-medium text-foreground">{formatNumber(skin.downloads)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-foreground/60">
                <MessageCircle className="h-4 w-4" />
                <span className="font-medium text-foreground">{comments.length}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={handleLike}
                className={cn(
                  'flex h-14 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-semibold transition-all',
                  liked
                    ? 'bg-neon-muted text-neon'
                    : 'bg-obsidian-card text-foreground hover:bg-obsidian-elevated'
                )}
              >
                <Heart className={cn('h-4 w-4', liked && 'fill-current')} />
                {liked ? 'Liked' : 'Like'}
              </button>
              <button
                onClick={handleDownload}
                className="flex h-14 flex-col items-center justify-center gap-1 rounded-xl bg-obsidian-card text-[10px] font-semibold text-foreground transition-colors hover:bg-obsidian-elevated"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
              <button
                onClick={handleEditSkin}
                className="flex h-14 flex-col items-center justify-center gap-1 rounded-xl bg-obsidian-card text-[10px] font-bold text-foreground transition-colors hover:bg-obsidian-elevated"
              >
                <Edit className="h-4 w-4" />
                Edit
              </button>
            </div>
          </section>

          {/* Comments Section */}
          <section className="border-t border-white/5 p-5">
            <button
              onClick={() => setShowComments(!showComments)}
              className="mb-4 flex w-full items-center justify-between"
            >
              <h3 className="text-sm font-bold text-foreground">
                Comments ({comments.length})
              </h3>
              <ChevronLeft className={cn(
                'h-4 w-4 text-muted-foreground transition-transform',
                showComments ? 'rotate-90' : '-rotate-90'
              )} />
            </button>

            {showComments && (
              <div className="space-y-3">
                {/* Comment Input */}
                <div className="flex gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-obsidian-elevated">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex flex-1 gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 rounded-lg border border-border bg-obsidian-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-neon focus:outline-none"
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                    />
                    <button
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim()}
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-neon text-obsidian transition-colors hover:bg-neon-bright disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Comments List */}
                {comments.length > 0 ? (
                  <div className="space-y-3">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-2">
                        <Link href={`/profile/${comment.authorId}`}>
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-obsidian-elevated transition-colors hover:bg-obsidian-card">
                            {comment.authorAvatar ? (
                              <Image
                                src={comment.authorAvatar}
                                alt={comment.authorName}
                                width={32}
                                height={32}
                                className="h-full w-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-xs font-bold text-muted-foreground">
                                {comment.authorName.charAt(0)}
                              </span>
                            )}
                          </div>
                        </Link>
                        <div className="flex-1">
                          <div className="rounded-lg bg-obsidian-card p-2">
                            <div className="flex items-center gap-2">
                              <Link 
                                href={`/profile/${comment.authorId}`}
                                className="text-xs font-bold text-foreground hover:text-neon"
                              >
                                {comment.authorName}
                              </Link>
                              <span className="text-[10px] text-muted-foreground">
                                {formatTimeAgo(comment.createdAt)}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {comment.content}
                            </p>
                          </div>
                          <div className="mt-1 flex items-center gap-3 px-2">
                            <button className="flex items-center gap-1 text-[10px] text-muted-foreground transition-colors hover:text-foreground">
                              <Heart className="h-3 w-3" />
                              {comment.likes}
                            </button>
                            <button className="text-[10px] text-muted-foreground transition-colors hover:text-foreground">
                              Reply
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-4 text-center text-xs text-muted-foreground">
                    No comments yet. Be the first to comment!
                  </p>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
