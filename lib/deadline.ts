export function isFormClosed(): boolean {
  const DEADLINE = new Date('2026-06-01T23:59:59+07:00');
  return new Date() > DEADLINE;
}
