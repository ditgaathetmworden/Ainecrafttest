'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, TrendingUp, Clock, Flame, Grid3X3, List, Heart, Download, MessageCircle, Send } from 'lucide-react'
import { BottomNav } from '@/components/layout/bottom-nav'
import { SkinCard } from '@/components/gallery/skin-card'
import { SkinViewer3D } from '@/components/editor/skin-viewer-3d'
import { mockSkins, formatNumber, getCommentsBySkinId, formatTimeAgo } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

type SortOption = 'trending' | 'newest' | 'popular'
type FilterOption = 'all' | '64x64' | '128x128'
type ViewMode = 'grid' | 'feed'

export default function GalleryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('trending')
  const [filter, setFilter] = useState<FilterOption>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  const filteredAndSortedSkins = useMemo(() => {
    let result = mockSkins.filter((skin) =>
      (skin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (skin.authorName?.toLowerCase() || '').includes(searchQuery.toLowerCase())) &&
      (filter === 'all' || skin.format === filter)
    )

    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } else if (sortBy === 'popular') {
      result.sort((a, b) => b.downloads - a.downloads)
    } else {
      result.sort((a, b) => b.likes - a.likes)
    }

    return result
  }, [searchQuery, sortBy])

  const sortOptions: { value: SortOption; label: string; icon: typeof TrendingUp }[] = [
    { value: 'trending', label: 'Hot', icon: Flame },
    { value: 'newest', label: 'New', icon: Clock },
    { value: 'popular', label: 'Top', icon: TrendingUp },
  ]

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background pb-16">
      {/* Header */}
      <header className="shrink-0 border-b border-border bg-obsidian-surface/95 backdrop-blur-lg">
        <div className="flex h-11 items-center justify-between px-4">
          <h1 className="text-xs font-bold tracking-wide">
            <span className="text-neon">Community</span>
            <span className="text-foreground"> Gallery</span>
          </h1>
          
          {/* View Toggle */}
          <div className="flex items-center gap-1 rounded-lg bg-obsidian-card p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
                viewMode === 'grid'
                  ? 'bg-neon text-obsidian'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Grid3X3 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode('feed')}
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
                viewMode === 'feed'
                  ? 'bg-neon text-obsidian'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Search & Filters */}
      <section className="shrink-0 border-b border-border bg-obsidian-surface px-3 py-2 space-y-2">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search skins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-xl border border-border bg-obsidian-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-neon focus:outline-none"
          />
        </div>

        {/* Sort Pills */}
        <div className="flex gap-1.5">
          {sortOptions.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setSortBy(value)}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-semibold tracking-wide transition-all',
                sortBy === value
                  ? 'pill-selected'
                  : 'pill-unselected'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
        
        {/* Format Filter */}
        <div className="flex gap-1.5">
          {(['all', '64x64', '128x128'] as FilterOption[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'flex-1 rounded-lg py-1.5 text-[11px] font-semibold tracking-wide transition-all capitalize',
                filter === f
                  ? 'bg-obsidian-elevated text-neon border border-neon'
                  : 'bg-obsidian-card text-muted-foreground border border-transparent'
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </section>

      {/* Content */}
      <main className="flex-1 overflow-auto p-3">
        {filteredAndSortedSkins.length > 0 ? (
          viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-2 gap-2">
              {filteredAndSortedSkins.map((skin) => (
                <SkinCard key={skin.id} skin={skin} />
              ))}
            </div>
          ) : (
            /* Feed View */
            <div className="flex flex-col gap-px">
              {filteredAndSortedSkins.map((skin) => {
                const comments = getCommentsBySkinId(skin.id)
                return (
                  <FeedCard key={skin.id} skin={skin} comments={comments} />
                )
              })}
            </div>
          )
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">No skins found</p>
              <p className="mt-1 text-xs text-muted-foreground/60">Try a different search</p>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}

// ─── Feed Card ────────────────────────────────────────────────────────────────

import type { SkinData, Comment } from '@/types/skin'

function FeedCard({ skin, comments }: { skin: SkinData; comments: Comment[] }) {
  const [liked, setLiked] = useState(false)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [commentInput, setCommentInput] = useState('')
  const [localComments, setLocalComments] = useState(comments)

  function handleComment(e: React.FormEvent) {
    e.preventDefault()
    const text = commentInput.trim()
    if (!text) return
    setLocalComments((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        skinId: skin.id,
        authorId: 'me',
        authorName: 'You',
        content: text,
        likes: 0,
        createdAt: new Date(),
      },
    ])
    setCommentInput('')
  }

  return (
    <>
      <article className="overflow-hidden rounded-xl bg-obsidian-card mb-3">
        {/* 3D Preview */}
        <Link href={`/gallery/${skin.id}`} className="block">
          <div 
            className="relative aspect-square overflow-hidden"
            style={{ backgroundImage: 'url(/minecraft-background.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
          >
            <div className="pointer-events-none absolute inset-0 z-10" />
            <SkinViewer3D
              skinUrl={skin.imageUrl}
              className="h-full w-full"
              animation="walk"
              autoRotate={false}
              showControls={false}
            />
          </div>
        </Link>

        {/* Info block */}
        <div className="px-4 pt-4 pb-3">
          <Link href={`/gallery/${skin.id}`}>
            <h3 className="text-base font-bold text-foreground leading-tight">{skin.name}</h3>
          </Link>
          <Link href={`/profile/${skin.authorId}`} className="mt-0.5 block text-sm text-neon hover:text-neon/80 transition-colors">
            @{skin.authorName ?? 'unknown'}
          </Link>
          {skin.description && (
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{skin.description}</p>
          )}

          {/* Divider */}
          <div className="my-3 h-px bg-border" />

          {/* Stats row — icon + count inline, like the reference */}
          <div className="flex items-center gap-5">
            <button
              onClick={() => setLiked((v) => !v)}
              className={cn('flex items-center gap-1.5 transition-colors', liked ? 'text-neon' : 'text-muted-foreground hover:text-foreground')}
            >
              <Heart className={cn('h-5 w-5', liked && 'fill-neon text-neon')} />
              <span className="text-sm font-medium">{formatNumber(skin.likes + (liked ? 1 : 0))}</span>
            </button>

            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Download className="h-5 w-5" />
              <span className="text-sm font-medium">{formatNumber(skin.downloads)}</span>
            </div>

            <button
              onClick={() => setCommentsOpen(true)}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm font-medium">{localComments.length}</span>
            </button>
          </div>
        </div>
      </article>

      {/* Comment bottom sheet */}
      {commentsOpen && (
        <div className="fixed inset-0 z-[100] flex items-end pb-16" onClick={() => setCommentsOpen(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70" />

          {/* Sheet */}
          <div
            className="relative w-full animate-in slide-in-from-bottom-4 ease-out duration-500 rounded-t-3xl bg-obsidian-card border-t border-border max-h-[60dvh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2 shrink-0">
              <div className="h-1 w-12 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Header */}
            <div className="px-4 pb-3 border-b border-border shrink-0">
              <h4 className="text-base font-bold text-foreground">
                Comments <span className="text-muted-foreground font-medium">({localComments.length})</span>
              </h4>
            </div>

            {/* Comments list */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
              {localComments.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No comments yet. Be the first!</p>
              )}
              {localComments.map((c) => (
                <div key={c.id} className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-foreground">{c.authorName}</span>
                  <span className="text-sm text-foreground/80 leading-relaxed">{c.content}</span>
                </div>
              ))}
            </div>

            {/* Comment input */}
            <form
              onSubmit={handleComment}
              className="shrink-0 flex items-center gap-3 border-t border-border px-4 py-4 bg-obsidian-elevated"
            >
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button
                type="submit"
                disabled={!commentInput.trim()}
                className="shrink-0 text-neon disabled:opacity-30 transition-opacity"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
