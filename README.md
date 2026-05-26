# Ainecraft Editor

A premium, responsive web-based Minecraft skin creator with AI-powered generative tools and advanced pixel editing capabilities.

## Features

### Core Functionality
- **3D Skin Viewer**: Real-time 3D preview of Minecraft skins with body part isolation
- **2D Pixel Editor**: Advanced pixel-perfect editing with UV grid mapping
- **Smart Brushes**: Pen, Eraser, Eyedropper, Bucket Fill, and intelligent brushes:
  - Classic Noise: Auto-texture with ±5-10% random lightness
  - Faux-Depth: Auto-shading with darker edges, lighter centers
  - Cluster: Organic chunking with 2x2 or irregular pixel deposits
- **Undo/Redo**: 50-step history for editing flexibility
- **Layer System**: Base and Outer layer support for Minecraft 1.8+ skins
- **AI Generation**: Text-to-skin generation via HuggingFace API
- **Import/Export**: Auto-downscales up to 1000x1000px → 128x128 HD or 64x64 Classic

### Community Features
- **Global Gallery**: Browse trending, newest, and most popular skins
- **Remixing**: Edit any published skin and create variations
- **User Profiles**: Profile pages with skin statistics and creation showcase
- **Skin Details**: View, download, like, and comment on published skins

### UI & Design
- **Obsidian Theme**: Dark mode with neon green (#4ade80) accents and cyber aesthetics
- **Mobile-First**: Responsive design with bottom navigation for mobile
- **Grid Layout**: 2-4 column configurable gallery view

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **State Management**: Zustand for editor state
- **3D Graphics**: skinview3d + Three.js for 3D rendering
- **AI Integration**: @gradio/client for HuggingFace Spaces API
- **Canvas**: HTML5 Canvas for 2D pixel editing

## Project Structure

```
├── app/
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Home/hub page
│   ├── editor/
│   │   └── page.tsx              # Main editor workspace
│   ├── gallery/
│   │   ├── page.tsx              # Gallery grid
│   │   └── [id]/page.tsx         # Skin detail view
│   ├── profile/
│   │   └── page.tsx              # User vault & profile
│   ├── api/
│   │   └── generate/route.ts     # AI generation proxy
│   └── globals.css               # Obsidian theme tokens
├── components/
│   ├── editor/
│   │   ├── skin-viewer-3d.tsx    # 3D preview with skinview3d
│   │   ├── pixel-canvas-2d.tsx   # 2D canvas editor
│   │   ├── body-part-selector.tsx # Part isolation UI
│   │   ├── tool-palette.tsx      # Brush tool selection
│   │   ├── color-palette.tsx     # Color picker
│   │   └── layer-toggle.tsx      # Base/Outer layer switcher
│   ├── ai/
│   │   └── prompt-input.tsx      # AI prompt interface
│   ├── gallery/
│   │   └── skin-card.tsx         # Skin preview card
│   └── layout/
│       └── bottom-nav.tsx        # Mobile navigation
├── lib/
│   ├── brush-algorithms.ts       # Smart brush implementations
│   ├── skin-utils.ts             # Image processing utilities
│   ├── mock-data.ts              # Sample gallery skins
│   └── utils.ts                  # Helper functions
├── stores/
│   └── editor-store.ts           # Zustand editor state
└── types/
    └── skin.ts                   # TypeScript definitions
```

## Getting Started

### Installation

```bash
# Using shadcn CLI (recommended)
pnpm dlx shadcn-cli@latest init ainecraft-editor

# Or manually install dependencies
pnpm install
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to start creating skins.

### Building for Production

```bash
pnpm build
pnpm start
```

## Key Components

### SkinViewer3D
3D preview with skinview3d integration. Supports:
- Full 3D model rotation and zoom
- Body part selection (Head, Torso, Arms, Legs)
- Layer visibility toggling
- Face direction selection (Front, Back, Left, Right, Top, Bottom)

### PixelCanvas2D
HTML5 Canvas-based 2D editor with:
- UV grid mapping for accurate body part editing
- Brush tools with customizable size (1-16px)
- Real-time sync between 3D and 2D
- Zoom and pan controls

### EditorStore (Zustand)
Centralized state for:
- Current skin texture data (ImageData)
- Selected tool and color
- Layer visibility
- Undo/Redo history
- Current editing part

### AI Generation
Integrates with HuggingFace Spaces:
- Text prompt → skin generation via Nick088/Minecraft_Skin_Generator
- Returns 64x64 or 128x128 PNG
- Direct import into editor

## API Routes

### `POST /api/generate`
Generates a Minecraft skin from a text prompt.

**Request:**
```json
{
  "prompt": "cyber knight with neon green armor"
}
```

**Response:**
```json
{
  "imageUrl": "data:image/png;base64,...",
  "width": 128,
  "height": 128
}
```

## Current Limitations (MVP)

- Guest-only creation (no authentication implemented)
- Mock gallery data (not persisted to database)
- No user accounts or publishing
- No real comments/likes
- Limited AI integration (text-only, no image upload)
- Single-device sessions (no sync)

## Future Enhancements

- User authentication (Email, Discord, Microsoft)
- Database persistence for skins and profiles
- Advanced moderation and content filtering
- Social features (following, direct messaging)
- Portfolio showcases and skin licensing
- Advanced brush templates library
- Batch export and skin packs
- Real-time collaboration
- Mobile app (React Native)

## Design System

### Colors (Obsidian Theme)
- **Primary**: #4ade80 (Neon Green)
- **Background**: #0f0f0f (Near Black)
- **Surface**: #1a1a1a (Dark Gray)
- **Border**: #333333 (Mid Gray)
- **Text**: #f5f5f5 (Off White)

### Fonts
- Headings: Geist (Bold)
- Body: Geist (Regular)
- Mono: Geist Mono (Code blocks)

## License

Built for Minecraft skin creators. Respect Minecraft's terms of service and IP rights.
