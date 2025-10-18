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
            <span className="text-xs text-muted-foreground">#{match.id}</span>
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
            <span className="text-xs text-muted-foreground">#{match.id}</span>
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

  const RoundWithConnectors = ({ 
    round, 
    roundIdx, 
    isLastRound 
  }: { 
    round: BracketMatch[]; 
    roundIdx: number; 
    isLastRound: boolean;
  }) => {
    const matchHeight = 80;
    const baseGap = 24;
    
    // Расстояние между матчами в текущем раунде
    const spacing = roundIdx === 0 ? baseGap : baseGap + (matchHeight + baseGap) * (Math.pow(2, roundIdx) - 1);
    
    // Верхний отступ для выравнивания раунда
    const topOffset = roundIdx === 0 ? 0 : (matchHeight + baseGap) * (Math.pow(2, roundIdx - 1) - 1) / 2 + (matchHeight / 2) * (Math.pow(2, roundIdx - 1));

    return (
      <div className="flex items-start">
        <div 
          className="flex flex-col" 
          style={{ 
            minWidth: '200px',
            gap: `${spacing}px`,
            marginTop: `${topOffset}px`
          }}
        >
          <div className="text-center mb-2 -mt-8">
            <Badge variant="outline" className="text-xs">
              {isLastRound ? 'Финал' : `Раунд ${roundIdx + 1}`}
            </Badge>
          </div>
          {round.map((match) => (
            <div key={match.id} style={{ height: `${matchHeight}px` }}>
              <MatchBox match={match} />
            </div>
          ))}
        </div>

        {!isLastRound && (
          <div 
            className="relative" 
            style={{ 
              width: '48px',
              height: `${round.length * matchHeight + (round.length - 1) * spacing}px`,
              marginTop: `${topOffset}px`
            }}
          >
            {round.map((_, idx) => {
              if (idx % 2 === 0 && idx < round.length - 1) {
                const matchSpacing = matchHeight + spacing;
                const startY = idx * matchSpacing + matchHeight / 2;
                const endY = (idx + 1) * matchSpacing + matchHeight / 2;
                const midY = (startY + endY) / 2;

                return (
                  <svg
                    key={idx}
                    className="absolute left-0 w-full h-full pointer-events-none"
                    style={{ top: 0 }}
                  >
                    <path
                      d={`M 0 ${startY} L 16 ${startY} L 16 ${midY} M 16 ${midY} L 48 ${midY} M 0 ${endY} L 16 ${endY} L 16 ${midY}`}
                      fill="none"
                      stroke="hsl(var(--border))"
                      strokeWidth="2"
                    />
                  </svg>
                );
              }
              return null;
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-12">
      {upperMatches.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Badge className="bg-green-500">Верхняя сетка</Badge>
            <span className="text-sm text-muted-foreground">Winner Bracket</span>
          </div>
          
          <div className="overflow-x-auto pb-4">
            <div className="inline-flex">
              {upperMatches.map((round, roundIdx) => (
                <RoundWithConnectors
                  key={roundIdx}
                  round={round}
                  roundIdx={roundIdx}
                  isLastRound={roundIdx === upperMatches.length - 1}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {lowerMatches.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Badge className="bg-orange-500">Нижняя сетка</Badge>
            <span className="text-sm text-muted-foreground">Loser Bracket</span>
          </div>
          
          <div className="overflow-x-auto pb-4">
            <div className="inline-flex">
              {lowerMatches.map((round, roundIdx) => (
                <RoundWithConnectors
                  key={roundIdx}
                  round={round}
                  roundIdx={roundIdx}
                  isLastRound={roundIdx === lowerMatches.length - 1}
                />
              ))}
            </div>
          </div>
        </div>
      )}

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