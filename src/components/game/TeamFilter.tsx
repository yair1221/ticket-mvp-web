'use client';

import { cn } from '@/lib/utils/cn';
import { TEAMS } from '@/lib/constants/teams';
import { Users } from 'lucide-react';
import TeamLogo from '@/components/shared/TeamLogo';

interface TeamFilterProps {
  selectedTeam: string | null;
  onSelect: (team: string | null) => void;
}

export default function TeamFilter({ selectedTeam, onSelect }: TeamFilterProps) {
  return (
    <div className="flex gap-3 overflow-x-auto no-scrollbar py-2 px-1 flex-row-reverse">
      <button
        onClick={() => onSelect(null)}
        className="flex flex-col items-center gap-1.5 min-w-[60px] transition-all"
      >
        <div className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors',
          selectedTeam === null
            ? 'border-brand bg-brand/10'
            : 'border-gray-200 bg-white'
        )}>
          <Users size={20} className={selectedTeam === null ? 'text-brand' : 'text-gray-400'} />
        </div>
        <span className={cn(
          'text-[10px] font-medium whitespace-nowrap',
          selectedTeam === null ? 'text-brand font-semibold' : 'text-gray-500'
        )}>
          הכל
        </span>
      </button>

      {TEAMS.map((team) => (
        <button
          key={team.id}
          onClick={() => onSelect(team.name === selectedTeam ? null : team.name)}
          className="flex flex-col items-center gap-1.5 min-w-[60px] transition-all"
        >
          <div className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors overflow-hidden p-1.5',
            selectedTeam === team.name
              ? 'border-brand bg-brand/10'
              : 'border-gray-200 bg-white'
          )}>
            <TeamLogo teamName={team.name} size={28} />
          </div>
          <span className={cn(
            'text-[10px] font-medium whitespace-nowrap',
            selectedTeam === team.name ? 'text-brand font-semibold' : 'text-gray-500'
          )}>
            {team.shortName}
          </span>
        </button>
      ))}
    </div>
  );
}
