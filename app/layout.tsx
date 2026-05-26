import type { Metadata, Viewport } from 'next'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { FirebaseAuthProvider } from '@/components/providers/firebase-auth-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ainecraft | Premium Minecraft Skin Editor',
  description: 'Craft your identity. The friction-free, professional-grade Minecraft skin editor. Generate via AI in seconds, edit pixel-by-pixel, or remix any creation.',
  keywords: ['Minecraft', 'skin editor', 'AI skin generator', 'Bedrock', 'Java', '128x128', 'HD skins'],
  authors: [{ name: 'Ainecraft Lab' }],
  openGraph: {
    title: 'Ainecraft | Premium Minecraft Skin Editor',
    description: 'Generate via AI in seconds, edit pixel-by-pixel, or remix any creation.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#050505',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark bg-background">
      <head>
        {/* Satoshi Font from Fontshare */}
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap" rel="stylesheet" />
        {/* Prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.remove('dark');document.documentElement.classList.add('light');}})();`,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <FirebaseAuthProvider>
            {children}
          </FirebaseAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

