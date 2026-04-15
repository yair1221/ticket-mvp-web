export function formatPhoneForWhatsapp(phone: string): string {
  let clean = phone.replace(/[-\s]/g, '');
  if (clean.startsWith('0')) clean = '972' + clean.slice(1);
  else if (clean.startsWith('+')) clean = clean.slice(1);
  return clean;
}

export function buildWhatsappLink(
  phone: string,
  homeTeam: string,
  awayTeam: string,
  section: string | null,
  price: number
): string {
  const cleanPhone = formatPhoneForWhatsapp(phone);
  const message = encodeURIComponent(
    `היי, אני מעוניין בכרטיס ל-${homeTeam} VS ${awayTeam}${section ? ` (${section})` : ''} במחיר ₪${price} שפורסם ב-Ticketil. האם הוא עדיין זמין?`
  );
  return `https://wa.me/${cleanPhone}?text=${message}`;
}
