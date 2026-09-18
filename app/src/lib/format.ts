// Indian digit grouping (lakh/crore — last 3 digits, then pairs), matching
// the reference's `n.toLocaleString("en-IN")`. Not relying on Intl since
// Hermes's en-IN locale data support isn't guaranteed. Same logic as
// IncomeSetupScreen's local copy; centralized here for every screen after
// it that needs to format a rupee amount.
export function formatIndianNumber(n: number): string {
  const intPart = Math.max(0, Math.trunc(Math.abs(n))).toString();
  const lastThree = intPart.slice(-3);
  const rest = intPart.slice(0, -3);
  const groupedRest = rest === '' ? '' : `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')},`;
  return groupedRest + lastThree;
}

// 12-hour clock ("3:42 PM"), matching the reference's own time formatting
// in its sample transaction subtitles. Hand-rolled rather than
// `toLocaleTimeString` for the same reason as formatIndianNumber above —
// Hermes's Intl locale-data support isn't guaranteed.
export function formatTime(ms: number): string {
  const d = new Date(ms);
  const h24 = d.getHours();
  const period = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 || 12;
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${h12}:${minutes} ${period}`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

// "Just now" / "12m ago" / "3h ago" / "5d ago", falling back to the same
// weekday/date shape as formatDay for anything older than a week — used
// for BackupSettingsScreen's "Last backup: …" line, where an exact
// timestamp matters less than a quick sense of how stale it is.
export function formatRelativeTime(ms: number, now: Date = new Date()): string {
  const diffMs = now.getTime() - ms;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDay(ms);
}

// Matches screens-main.jsx's SAMPLE_TXNS "day" field: "Today · Apr 23" for
// today, bare "Yesterday" for yesterday, "Mon · Apr 21" for anything older
// (weekday + date, no year — this app has no need to show transactions
// more than a few months old yet).
export function formatDay(ms: number): string {
  const d = new Date(ms);
  const today = startOfDay(new Date());
  const that = startOfDay(d);
  const dayDiff = Math.round((today - that) / 86400000);
  const dateLabel = `${MONTHS[d.getMonth()]} ${d.getDate()}`;
  if (dayDiff === 0) return `Today · ${dateLabel}`;
  if (dayDiff === 1) return 'Yesterday';
  return `${WEEKDAYS[d.getDay()]} · ${dateLabel}`;
}
