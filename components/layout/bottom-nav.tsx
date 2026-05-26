'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, Pencil, Sparkles, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/gallery', icon: LayoutGrid, label: 'Gallery' },
  { href: '/editor', icon: Pencil, label: 'Editor' },
  { href: '/', icon: Sparkles, label: 'AI' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-obsidian-surface/95 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon



          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'bottom-nav-item flex flex-col items-center gap-1 px-3 py-2',
                isActive && 'active'
              )}
            >
              <Icon
                className={cn(
                  'nav-icon h-5 w-5 transition-colors',
                  isActive ? 'text-neon' : 'text-muted-foreground'
                )}
              />
              <span
                className={cn(
                  'text-[10px] font-medium tracking-wide',
                  isActive ? 'text-neon' : 'text-muted-foreground'
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
      
      {/* Safe area padding for mobile */}
      <div className="h-safe-area-inset-bottom" />
    </nav>
  )
}
