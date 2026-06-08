export function isFormClosed(): boolean {
  const DEADLINE = new Date('2026-06-17T23:59:59+07:00');
  return new Date() > DEADLINE;
}
