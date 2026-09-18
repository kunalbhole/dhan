// A session-only global toast queue, mirroring src/lib/billsStore.ts's
// subscribe/notify pattern. Lets any screen or sheet fire a success
// message after a state-changing action without prop-drilling a callback
// through react-navigation params — matching app.jsx's own single
// `showToast`, reachable from anywhere in the reference and rendered once
// at the app root (see src/components/Toast.tsx).
type Listener = (msg: string | null) => void;
const listeners = new Set<Listener>();
let timer: ReturnType<typeof setTimeout> | null = null;

export function showToast(msg: string): void {
  listeners.forEach(l => l(msg));
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => listeners.forEach(l => l(null)), 2600);
}

export function subscribeToToast(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
