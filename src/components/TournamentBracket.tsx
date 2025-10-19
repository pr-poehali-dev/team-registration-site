import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface BracketMatch {
  id: number;
  team1: string;
  team2: string;
  score1?: number;
  score2?: number;
  winner?: 1 | 2;
}

interface BracketProps {
  upperMatches: BracketMatch[][];
  lowerMatches: BracketMatch[][];
  finals?: BracketMatch;
}

export default function TournamentBracket({ upperMatches, lowerMatches, finals }: BracketProps) {
  const MatchBox = ({ match, isWinner }: { match: BracketMatch; isWinner?: boolean }) => {
    const team1Won = match.winner === 1;
    const team2Won = match.winner === 2;

    return (
      <div className={`bg-card border rounded-lg overflow-hidden ${isWinner ? 'border-yellow-500 shadow-lg' : 'border-border'}`}>
        <div className={`flex items-center justify-between p-2 border-b ${team1Won ? 'bg-green-500/10' : ''}`}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-xs text-muted-foreground">{match.id}</span>
            <span className="text-sm font-medium truncate">{match.team1}</span>
          </div>
          {match.score1 !== undefined && (
            <span className={`text-sm font-bold ml-2 ${team1Won ? 'text-green-600' : ''}`}>
              {match.score1}
            </span>
          )}
        </div>
        <div className={`flex items-center justify-between p-2 ${team2Won ? 'bg-green-500/10' : ''}`}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-xs text-muted-foreground">{match.id}</span>
            <span className="text-sm font-medium truncate">{match.team2}</span>
          </div>
          {match.score2 !== undefined && (
            <span className={`text-sm font-bold ml-2 ${team2Won ? 'text-green-600' : ''}`}>
              {match.score2}
            </span>
          )}
        </div>
      </div>
    );
  };

  const EmptySlot = ({ text }: { text: string }) => (
    <div className="bg-muted/30 border border-dashed rounded-lg p-2">
      <div className="text-xs text-muted-foreground text-center py-2">{text}</div>
    </div>
  );

  const ConnectorLines = ({ roundIndex, totalMatches }: { roundIndex: number; totalMatches: number }) => {
    return (
      <div className="flex flex-col justify-around h-full py-4">
        {Array.from({ length: totalMatches }).map((_, idx) => (
          <div key={idx} className="relative h-24">
            <svg className="absolute w-full h-full" style={{ overflow: 'visible' }}>
              <path
                d={`M 0 ${idx % 2 === 0 ? 12 : 36} L 20 ${idx % 2 === 0 ? 12 : 36} L 20 24 L 40 24`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-border"
              />
            </svg>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-12">
      {/* Верхняя сетка */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Badge className="bg-green-500">Верхняя сетка</Badge>
          <span className="text-sm text-muted-foreground">Winner Bracket</span>
        </div>
        
        <div className="overflow-x-auto pb-4">
          <div className="inline-flex gap-8 min-w-full">
            {upperMatches.map((round, roundIdx) => (
              <div key={roundIdx} className="flex flex-col gap-2" style={{ minWidth: '200px' }}>
                <div className="text-center mb-2">
                  <Badge variant="outline" className="text-xs">
                    {roundIdx === upperMatches.length - 1 ? 'Финал Winner' : `Раунд ${roundIdx + 1}`}
                  </Badge>
                </div>
                <div className="flex flex-col justify-around gap-6">
                  {round.map((match) => (
                    <MatchBox key={match.id} match={match} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Нижняя сетка */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Badge className="bg-orange-500">Нижняя сетка</Badge>
          <span className="text-sm text-muted-foreground">Loser Bracket</span>
        </div>
        
        <div className="overflow-x-auto pb-4">
          <div className="inline-flex gap-8 min-w-full">
            {lowerMatches.map((round, roundIdx) => (
              <div key={roundIdx} className="flex flex-col gap-2" style={{ minWidth: '200px' }}>
                <div className="text-center mb-2">
                  <Badge variant="outline" className="text-xs">
                    Loser Round {roundIdx + 1}
                  </Badge>
                </div>
                <div className="flex flex-col justify-around gap-6">
                  {round.length > 0 ? (
                    round.map((match) => (
                      <MatchBox key={match.id} match={match} />
                    ))
                  ) : (
                    <EmptySlot text="TBD" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Гранд финал */}
      {finals && (
        <div>
          <div className="mb-4 flex items-center gap-2 justify-center">
            <Badge className="bg-yellow-500">Гранд финал</Badge>
          </div>
          <div className="max-w-xs mx-auto">
            <MatchBox match={finals} isWinner />
          </div>
        </div>
      )}
    </div>
  );
}
