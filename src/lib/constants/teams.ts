export interface Team {
  name: string;
  city: string;
  logo: string;
}

export const TEAMS: Team[] = [
  { name: 'מכבי ת"א', city: 'תל אביב', logo: '/teams/maccabi-tel-aviv.svg' },
  { name: 'הפועל ת"א', city: 'תל אביב', logo: '/teams/hapoel-tel-aviv.svg' },
  { name: 'בית"ר י-ם', city: 'ירושלים', logo: '/teams/beitar-jerusalem.svg' },
  { name: 'מכבי חיפה', city: 'חיפה', logo: '/teams/maccabi-haifa.svg' },
  { name: 'הפועל ב"ש', city: 'באר שבע', logo: '/teams/hapoel-beer-sheva.svg' },
  { name: 'הפועל חיפה', city: 'חיפה', logo: '/teams/hapoel-haifa.svg' },
  { name: 'בני סכנין', city: 'סכנין', logo: '/teams/bnei-sakhnin.svg' },
  { name: 'מ.ס. אשדוד', city: 'אשדוד', logo: '/teams/ashdod.svg' },
  { name: 'מכבי נתניה', city: 'נתניה', logo: '/teams/maccabi-netanya.svg' },
  { name: 'הפועל י-ם', city: 'ירושלים', logo: '/teams/hapoel-jerusalem.svg' },
  { name: 'מכבי בני ריינה', city: 'ריינה', logo: '/teams/maccabi-bnei-reineh.svg' },
  { name: 'עירוני טבריה', city: 'טבריה', logo: '/teams/ironi-tiberias.svg' },
  { name: 'הפועל ק"ש', city: 'קריית שמונה', logo: '/teams/hapoel-kiryat-shmona.svg' },
  { name: 'הפועל פ"ת', city: 'פתח תקווה', logo: '/teams/hapoel-petah-tikva.svg' },
];

export function getTeam(name: string): Team | undefined {
  return TEAMS.find((t) => t.name === name);
}
