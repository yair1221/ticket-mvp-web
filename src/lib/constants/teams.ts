export interface Team {
  id: string;
  name: string;
  shortName: string;
  logo: string;
}

export const TEAMS: Team[] = [
  { id: 'maccabi-tel-aviv', name: 'מכבי תל אביב', shortName: 'מכבי ת"א', logo: '/teams/maccabi-tel-aviv.svg' },
  { id: 'hapoel-tel-aviv', name: 'הפועל תל אביב', shortName: 'הפועל ת"א', logo: '/teams/hapoel-tel-aviv.svg' },
  { id: 'beitar-jerusalem', name: 'בית"ר ירושלים', shortName: 'בית"ר י-ם', logo: '/teams/beitar-jerusalem.svg' },
  { id: 'maccabi-haifa', name: 'מכבי חיפה', shortName: 'מכבי חיפה', logo: '/teams/maccabi-haifa.svg' },
  { id: 'hapoel-beer-sheva', name: 'הפועל באר שבע', shortName: 'הפועל ב"ש', logo: '/teams/hapoel-beer-sheva.svg' },
  { id: 'hapoel-haifa', name: 'הפועל חיפה', shortName: 'הפועל חיפה', logo: '/teams/hapoel-haifa.svg' },
  { id: 'bnei-sakhnin', name: 'בני סחנין', shortName: 'בני סחנין', logo: '/teams/bnei-sakhnin.svg' },
  { id: 'ashdod', name: 'מ.ס. אשדוד', shortName: 'מ.ס. אשדוד', logo: '/teams/ashdod.svg' },
  { id: 'maccabi-netanya', name: 'מכבי נתניה', shortName: 'מכבי נתניה', logo: '/teams/maccabi-netanya.svg' },
  { id: 'hapoel-jerusalem', name: 'הפועל ירושלים', shortName: 'הפועל י-ם', logo: '/teams/hapoel-jerusalem.svg' },
  { id: 'maccabi-bnei-reineh', name: 'מכבי בני ריינה', shortName: 'מכבי בנ"ר', logo: '/teams/maccabi-bnei-reineh.svg' },
  { id: 'ironi-tiberias', name: 'עירוני טבריה', shortName: 'עירוני טבריה', logo: '/teams/ironi-tiberias.svg' },
  { id: 'hapoel-kiryat-shmona', name: 'הפועל קריית שמונה', shortName: 'הפועל ק"ש', logo: '/teams/hapoel-kiryat-shmona.svg' },
  { id: 'hapoel-petah-tikva', name: 'הפועל פתח תקווה', shortName: 'הפועל פ"ת', logo: '/teams/hapoel-petah-tikva.svg' },
];
