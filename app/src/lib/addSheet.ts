// Session-only pub-sub for the global "+" action sheet, mirroring
// src/lib/toast.ts's pattern exactly: AppHeader (mounted separately on
// every screen) calls openAddSheet() rather than owning any sheet state
// itself, and the one <GlobalAddSheet /> instance (mounted once in
// App.tsx, next to <Toast />) is what actually listens and renders.
type Listener = () => void;
const listeners = new Set<Listener>();

export function openAddSheet(): void {
  listeners.forEach(l => l());
}

export function subscribeToAddSheet(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
