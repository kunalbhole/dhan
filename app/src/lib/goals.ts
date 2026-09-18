// Ported from screens-extra-detail.jsx's GoalsScreen/EditGoalSheet.
// Goals are pure user-entered targets (name, saved-so-far, target amount,
// monthly contribution, ETA) — unlike Bills there's no real transaction
// pattern to detect them from, so this is a plain persisted store the
// user creates/edits/deletes into directly (see goalsStore.ts).
export interface Goal {
  id: string;
  name: string;
  icon: string; // one of GOAL_ICON_IDS
  color: string; // one of GOAL_COLORS
  saved: number;
  target: number;
  eta: string; // free text, e.g. "Sep 2026" — matches the reference's own field
  contrib: number; // monthly contribution, ₹/mo
}

// screens-extra-detail.jsx's GOAL_ICONS/GOAL_COLORS. The reference also
// offers a free-form emoji picker (EmojiTile) alongside these eight preset
// icons — simplified out here since it needs its own emoji-picker
// component for real device use; the eight presets cover the common goal
// types (fund, trip, gadget, gift, home, education, car, generic target).
export const GOAL_ICON_IDS = ['shield-check', 'airplane-tilt', 'laptop', 'gift', 'house-line', 'graduation-cap', 'car', 'target'] as const;
export type GoalIconId = (typeof GOAL_ICON_IDS)[number];

export const GOAL_COLORS = ['#2E7D5B', '#6A8FD4', '#C97BB6', '#E88B5C', '#141C41', '#C9A84C'];
