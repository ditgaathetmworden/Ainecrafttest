'use client'

import { create } from 'zustand'
import type { BodyPart, BodyFace, SkinLayer, BrushTool, RGBAColor, HistoryState, SkinFormat } from '@/types/skin'

const MAX_HISTORY = 50

interface EditorState {
  // Current skin data
  skinImageData: ImageData | null
  skinFormat: SkinFormat
  skinUrl: string | null
  
  // Editor mode
  selectedPart: BodyPart
  selectedFace: BodyFace
  selectedLayer: SkinLayer
  
  // Tools
  currentTool: BrushTool
  brushSize: number
  currentColor: RGBAColor
  
  // Color palette (extracted from skin or user-defined)
  palette: RGBAColor[]
  
  // History
  undoStack: HistoryState[]
  redoStack: HistoryState[]
  
  // UI state
  isLoading: boolean
  show3DView: boolean
  
  // Actions
  setSkinImageData: (data: ImageData | null) => void
  setSkinFormat: (format: SkinFormat) => void
  setSkinUrl: (url: string | null) => void
  setSelectedPart: (part: BodyPart) => void
  setSelectedFace: (face: BodyFace) => void
  setSelectedLayer: (layer: SkinLayer) => void
  setCurrentTool: (tool: BrushTool) => void
  setBrushSize: (size: number) => void
  setCurrentColor: (color: RGBAColor) => void
  setPalette: (palette: RGBAColor[]) => void
  addToPalette: (color: RGBAColor) => void
  
  // History actions
  pushHistory: (state: HistoryState) => void
  undo: () => HistoryState | null
  redo: () => HistoryState | null
  clearHistory: () => void
  
  // UI actions
  setIsLoading: (loading: boolean) => void
  setShow3DView: (show: boolean) => void
  
  // Reset
  resetEditor: () => void
}

const initialColor: RGBAColor = { r: 74, g: 222, b: 128, a: 255 } // Neon green

const defaultPalette: RGBAColor[] = [
  { r: 74, g: 222, b: 128, a: 255 },   // Neon green
  { r: 255, g: 224, b: 189, a: 255 },  // Skin tone light
  { r: 139, g: 90, b: 43, a: 255 },    // Brown
  { r: 180, g: 82, b: 82, a: 255 },    // Red
  { r: 255, g: 170, b: 51, a: 255 },   // Orange
  { r: 255, g: 51, b: 51, a: 255 },    // Bright red
  { r: 255, g: 204, b: 102, a: 255 },  // Gold
  { r: 255, g: 200, b: 87, a: 255 },   // Yellow
  { r: 204, g: 51, b: 51, a: 255 },    // Dark red
]

export const useEditorStore = create<EditorState>((set, get) => ({
  // Initial state
  skinImageData: null,
  skinFormat: '64x64',
  skinUrl: null,
  selectedPart: 'head',
  selectedFace: 'front',
  selectedLayer: 'base',
  currentTool: 'pen',
  brushSize: 1,
  currentColor: initialColor,
  palette: defaultPalette,
  undoStack: [],
  redoStack: [],
  isLoading: false,
  show3DView: true,
  
  // Setters
  setSkinImageData: (data) => set({ skinImageData: data }),
  setSkinFormat: (format) => set({ skinFormat: format }),
  setSkinUrl: (url) => set({ skinUrl: url }),
  setSelectedPart: (part) => set({ selectedPart: part }),
  setSelectedFace: (face) => set({ selectedFace: face }),
  setSelectedLayer: (layer) => set({ selectedLayer: layer }),
  setCurrentTool: (tool) => set({ currentTool: tool }),
  setBrushSize: (size) => set({ brushSize: Math.max(1, Math.min(10, size)) }),
  setCurrentColor: (color) => set({ currentColor: color }),
  setPalette: (palette) => set({ palette }),
  
  addToPalette: (color) => {
    const { palette } = get()
    // Check if color already exists
    const exists = palette.some(
      c => c.r === color.r && c.g === color.g && c.b === color.b && c.a === color.a
    )
    if (!exists && palette.length < 20) {
      set({ palette: [...palette, color] })
    }
  },
  
  // History
  pushHistory: (state) => {
    const { undoStack } = get()
    const newStack = [...undoStack, state]
    if (newStack.length > MAX_HISTORY) {
      newStack.shift()
    }
    set({ undoStack: newStack, redoStack: [] })
  },
  
  undo: () => {
    const { undoStack, redoStack, skinImageData, selectedLayer } = get()
    if (undoStack.length === 0) return null
    
    const newUndo = [...undoStack]
    const lastState = newUndo.pop()!
    
    // Save current state to redo
    if (skinImageData) {
      const currentState: HistoryState = {
        imageData: skinImageData,
        layer: selectedLayer,
        timestamp: Date.now(),
      }
      set({
        undoStack: newUndo,
        redoStack: [...redoStack, currentState],
      })
    } else {
      set({ undoStack: newUndo })
    }
    
    return lastState
  },
  
  redo: () => {
    const { undoStack, redoStack, skinImageData, selectedLayer } = get()
    if (redoStack.length === 0) return null
    
    const newRedo = [...redoStack]
    const nextState = newRedo.pop()!
    
    // Save current state to undo
    if (skinImageData) {
      const currentState: HistoryState = {
        imageData: skinImageData,
        layer: selectedLayer,
        timestamp: Date.now(),
      }
      set({
        redoStack: newRedo,
        undoStack: [...undoStack, currentState],
      })
    } else {
      set({ redoStack: newRedo })
    }
    
    return nextState
  },
  
  clearHistory: () => set({ undoStack: [], redoStack: [] }),
  
  // UI
  setIsLoading: (loading) => set({ isLoading: loading }),
  setShow3DView: (show) => set({ show3DView: show }),
  
  // Reset
  resetEditor: () => set({
    skinImageData: null,
    skinFormat: '64x64',
    skinUrl: null,
    selectedPart: 'head',
    selectedFace: 'front',
    selectedLayer: 'base',
    currentTool: 'pen',
    brushSize: 1,
    currentColor: initialColor,
    palette: defaultPalette,
    undoStack: [],
    redoStack: [],
    isLoading: false,
    show3DView: true,
  }),
}))
