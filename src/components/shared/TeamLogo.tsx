import Image from 'next/image';
import { Shield } from 'lucide-react';
import { TEAMS } from '@/lib/constants/teams';

interface TeamLogoProps {
  teamName: string;
  size?: number;
}

function getTeamLogoPath(teamName: string): string | null {
  const team = TEAMS.find((t) => t.name === teamName);
  return team?.logo ?? null;
}

export default function TeamLogo({ teamName, size = 48 }: TeamLogoProps) {
  const logoPath = getTeamLogoPath(teamName);

  if (!logoPath) {
    return (
      <div
        className="flex items-center justify-center rounded-full bg-brand/10"
        style={{ width: size, height: size }}
      >
        <Shield size={size * 0.6} className="text-brand" />
      </div>
    );
  }

  return (
    <Image
      src={logoPath}
      alt={teamName}
      width={size}
      height={size}
      className="object-contain"
    />
  );
}
