export function formatPrice(price: number): string {
  return `₪${price.toLocaleString('he-IL')}`;
}

export function formatEventDate(date: string): string {
  return new Date(date).toLocaleDateString('he-IL');
}

export function formatEventTime(time: string): string {
  return time.slice(0, 5);
}
