export function formatPrice(price: number): string {
  return `₪${price.toLocaleString('he-IL')}`;
}

export function formatEventDate(date: string, tbd?: boolean): string {
  const formatted = new Date(date).toLocaleDateString('he-IL');
  return tbd ? `${formatted} (סופ״ש, יום מדויק טרם נקבע)` : formatted;
}

export function formatEventTime(time: string, tbd?: boolean): string {
  if (tbd) return 'טרם נקבעה';
  return time.slice(0, 5);
}
