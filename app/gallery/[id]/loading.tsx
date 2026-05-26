export default function Loading() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-neon border-t-transparent" />
      <p className="mt-4 text-sm text-muted-foreground">Loading skin details...</p>
    </div>
  )
}
