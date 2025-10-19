import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

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
  const isByeMatch = (team2: string) => {
    const lower = team2.toLowerCase();
    return lower.includes('bye') || lower.includes('автопроход');
  };

  const MatchCard = ({ match }: { match: BracketMatch }) => {
    const team1Won = match.winner === 1;
    const team2Won = match.winner === 2;
    const isBye = isByeMatch(match.team2);

    if (isBye) {
      return (
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-dashed border-primary/30 rounded-xl p-4 min-w-[240px] relative">
          <div className="absolute -top-3 -left-3 bg-primary/20 text-primary rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold shadow">
            {match.id}
          </div>
          <div className="flex flex-col items-center gap-2">
            <Icon name="ArrowRight" size={20} className="text-primary animate-pulse" />
            <span className="font-semibold text-sm">{match.team1}</span>
            <Badge variant="secondary" className="text-xs">
              <Icon name="FastForward" size={12} className="mr-1" />
              Автопроход
            </Badge>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-card border-2 border-border hover:border-primary/50 rounded-xl overflow-hidden min-w-[240px] relative transition-all shadow-sm hover:shadow-md">
        <div className="absolute -top-3 -left-3 bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold shadow-md z-10">
          {match.id}
        </div>
        
        <div className={`flex items-center justify-between px-4 py-3 transition-colors ${
          team1Won ? 'bg-green-500/15 border-l-4 border-green-500' : 'border-l-4 border-transparent'
        }`}>
          <div className="flex items-center gap-2 flex-1 min-w-0 my-0 px-0 py-0 mx-0 rounded-3xl">
            {team1Won && <Icon name="Trophy" size={14} className="text-green-600 flex-shrink-0" />}
            <span className={`text-sm truncate ${team1Won ? 'font-bold' : 'font-medium'}`}>
              {match.team1}
            </span>
          </div>
          {match.score1 !== undefined && (
            <span className={`text-lg font-bold ml-3 ${team1Won ? 'text-green-600' : 'text-muted-foreground'}`}>
              {match.score1}
            </span>
          )}
        </div>

        <div className="h-px bg-border"></div>

        <div className={`flex items-center justify-between px-4 py-3 transition-colors ${
          team2Won ? 'bg-green-500/15 border-l-4 border-green-500' : 'border-l-4 border-transparent'
        }`}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {team2Won && <Icon name="Trophy" size={14} className="text-green-600 flex-shrink-0" />}
            <span className={`text-sm truncate ${team2Won ? 'font-bold' : 'font-medium'}`}>
              {match.team2}
            </span>
          </div>
          {match.score2 !== undefined && (
            <span className={`text-lg font-bold ml-3 ${team2Won ? 'text-green-600' : 'text-muted-foreground'}`}>
              {match.score2}
            </span>
          )}
        </div>
      </div>
    );
  };

  const Round = ({ matches, title, roundIndex }: { matches: BracketMatch[]; title: string; roundIndex: number }) => (
    <div className="flex flex-col gap-4 min-w-[260px]">
      <div className="text-center sticky top-0 bg-background/95 backdrop-blur py-2 z-10">
        <Badge variant="outline" className="font-semibold">
          {title}
        </Badge>
        <div className="text-xs text-muted-foreground mt-1">
          {matches.length} {matches.length === 1 ? 'матч' : 'матча'}
        </div>
      </div>
      <div className="flex flex-col gap-6" style={{ marginTop: roundIndex === 1 ? '0' : undefined }}>
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-16">
      {upperMatches.length > 0 && (
        <div>
          <div className="mb-8 flex items-center justify-center gap-3">
            <div className="h-px bg-gradient-to-r from-transparent via-green-500 to-transparent flex-1"></div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5">
                <Icon name="TrendingUp" size={16} className="mr-2" />
                Верхняя сетка
              </Badge>
              <span className="text-sm text-muted-foreground">Winner Bracket</span>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-green-500 to-transparent flex-1"></div>
          </div>
          
          <div className="overflow-x-auto pb-6">
            <div className="inline-flex gap-12 items-start px-4">
              {upperMatches.map((round, idx) => (
                <Round 
                  key={idx}
                  matches={round} 
                  roundIndex={idx}
                  title={idx === upperMatches.length - 1 ? '🏆 Финал верхней сетки' : `Раунд ${idx + 1}`} 
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {lowerMatches.length > 0 && (
        <div>
          <div className="mb-8 flex items-center justify-center gap-3">
            <div className="h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent flex-1"></div>
            <div className="flex items-center gap-2">
              <Badge className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5">
                <Icon name="TrendingDown" size={16} className="mr-2" />
                Нижняя сетка
              </Badge>
              <span className="text-sm text-muted-foreground">Loser Bracket</span>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent flex-1"></div>
          </div>
          
          <div className="overflow-x-auto pb-6">
            <div className="inline-flex gap-12 items-start px-4">
              {lowerMatches.map((round, idx) => (
                <Round 
                  key={idx}
                  matches={round} 
                  roundIndex={idx}
                  title={idx === lowerMatches.length - 1 ? '🔥 Финал нижней сетки' : `Раунд ${idx + 1}`} 
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {finals && (
        <div>
          <div className="mb-8 flex items-center justify-center gap-3">
            <div className="h-px bg-gradient-to-r from-transparent via-yellow-500 to-transparent flex-1"></div>
            <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-6 py-2 text-base shadow-lg">
              <Icon name="Crown" size={20} className="mr-2" />
              Гранд Финал
            </Badge>
            <div className="h-px bg-gradient-to-r from-transparent via-yellow-500 to-transparent flex-1"></div>
          </div>
          <div className="max-w-sm mx-auto">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 blur-xl"></div>
              <MatchCard match={finals} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}