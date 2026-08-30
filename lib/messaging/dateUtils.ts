/** Local calendar day key (YYYY-MM-DD) in the viewer's timezone — used to bucket/compare messages by day. */
export function toLocalDayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isSameLocalDay(a: Date, b: Date): boolean {
  return toLocalDayKey(a) === toLocalDayKey(b);
}
