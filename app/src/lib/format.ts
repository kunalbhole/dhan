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
