import Icon from '@/components/ui/icon';
import { Match } from './types';

interface MatchListProps {
  matches: Match[];
  selectedMatch: Match | null;
  onSelectMatch: (match: Match) => void;
}

export default function MatchList({ matches, selectedMatch, onSelectMatch }: MatchListProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Список матчей</h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {matches.map((match) => (
          <div
            key={match.id}
            onClick={() => onSelectMatch(match)}
            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedMatch?.id === match.id
                ? 'border-primary bg-primary/5'
                : 'hover:border-primary/50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">
                Match #{match.match_number} - {match.bracket_type} R{match.round_number}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded ${
                match.status === 'finished' ? 'bg-green-500/20 text-green-700' :
                match.status === 'live' ? 'bg-red-500/20 text-red-700' :
                'bg-gray-500/20 text-gray-700'
              }`}>
                {match.status}
              </span>
            </div>
            <div className="text-sm">
              <div>{match.team1_name || match.team1_placeholder || 'TBD'}</div>
              <div className="text-xs text-muted-foreground">vs</div>
              <div>{match.team2_name || match.team2_placeholder || 'TBD'}</div>
            </div>
            {match.score1 !== undefined && match.score2 !== undefined && (
              <div className="text-sm font-bold mt-1">
                {match.score1} - {match.score2}
              </div>
            )}
          </div>
        ))}
        {matches.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            Матчей пока нет
          </p>
        )}
      </div>
    </div>
  );
}
