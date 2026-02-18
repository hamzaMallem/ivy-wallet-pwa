export function LoadingScreen() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
          <span className="text-2xl font-bold text-on-primary">IW</span>
        </div>
        <div className="relative h-1 w-40 overflow-hidden rounded-full bg-surface-variant">
          <div className="animate-loading-bar absolute inset-y-0 w-1/2 rounded-full bg-primary" />
        </div>
      </div>
    </div>
  );
}
