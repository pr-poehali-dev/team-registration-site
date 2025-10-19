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
  const MatchCard = ({ match, highlight = false }: { match: BracketMatch; highlight?: boolean }) => {
    const team1Won = match.winner === 1;
    const team2Won = match.winner === 2;

    return (
      <div className={`bg-card border rounded-lg overflow-hidden min-w-[200px] relative ${highlight ? 'border-yellow-500 shadow-lg' : ''}`}>
        <div className="absolute -top-2 -left-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md z-10">
          {match.id}
        </div>
        <div className={`flex items-center justify-between p-3 border-b ${team1Won ? 'bg-green-500/10' : ''}`}>
          <span className="text-sm font-medium truncate">{match.team1}</span>
          {match.score1 !== undefined && (
            <span className={`text-lg font-bold ml-2 ${team1Won ? 'text-green-600' : ''}`}>
              {match.score1}
            </span>
          )}
        </div>
        <div className={`flex items-center justify-between p-3 ${team2Won ? 'bg-green-500/10' : ''}`}>
          <span className="text-sm font-medium truncate">{match.team2}</span>
          {match.score2 !== undefined && (
            <span className={`text-lg font-bold ml-2 ${team2Won ? 'text-green-600' : ''}`}>
              {match.score2}
            </span>
          )}
        </div>
      </div>
    );
  };

  const Round = ({ matches, title }: { matches: BracketMatch[]; title: string }) => (
    <div className="flex flex-col gap-6 min-w-[220px]">
      <div className="text-center">
        <Badge variant="outline">{title}</Badge>
      </div>
      <div className="flex flex-col gap-6 my-[51px]">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-12">
      {upperMatches.length > 0 && (
        <div>
          <div className="mb-6 flex items-center gap-2">
            <Badge className="bg-green-500">Верхняя сетка</Badge>
            <span className="text-sm text-muted-foreground">Winner Bracket</span>
          </div>
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-8 items-start">
              {upperMatches.map((round, idx) => (
                <Round 
                  key={idx} 
                  matches={round} 
                  title={idx === upperMatches.length - 1 ? 'Финал верхней сетки' : `Раунд ${idx + 1}`} 
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {lowerMatches.length > 0 && (
        <div>
          <div className="mb-6 flex items-center gap-2">
            <Badge className="bg-orange-500">Нижняя сетка</Badge>
            <span className="text-sm text-muted-foreground">Loser Bracket</span>
          </div>
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-8 items-start">
              {lowerMatches.map((round, idx) => (
                <Round 
                  key={idx} 
                  matches={round} 
                  title={idx === lowerMatches.length - 1 ? 'Финал нижней сетки' : `Раунд ${idx + 1}`} 
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {finals && (
        <div>
          <div className="mb-6 flex items-center gap-2 justify-center">
            <Badge className="bg-yellow-500">Гранд финал</Badge>
          </div>
          <div className="max-w-xs mx-auto">
            <MatchCard match={finals} highlight />
          </div>
        </div>
      )}
    </div>
  );
}