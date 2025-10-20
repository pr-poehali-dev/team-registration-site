import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import TournamentBracket from '@/components/TournamentBracket';
import { API_CONFIG } from '@/config/api';

const API_URL = API_CONFIG.TEAMS_URL;

interface Match {
  id: number;
  team1: string;
  team2: string;
  score1?: number;
  score2?: number;
  status: 'upcoming' | 'live' | 'finished';
  time: string;
  round: string;
  winner?: 1 | 2;
}

interface DBMatch {
  id: number;
  match_number: number;
  bracket_type: string;
  round_number: number;
  team1_name?: string;
  team2_name?: string;
  team1_placeholder?: string;
  team2_placeholder?: string;
  score1?: number;
  score2?: number;
  winner?: number;
  status: string;
  scheduled_time?: string;
}

export default function ScheduleSection() {
  const [activeTab, setActiveTab] = useState('bracket');
  const [dbMatches, setDbMatches] = useState<DBMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const response = await fetch(`${API_URL}?resource=matches`);
      const data = await response.json();
      if (data.success) {
        setDbMatches(data.matches);
      }
    } catch (error) {
      console.error('Failed to load matches:', error);
    } finally {
      setLoading(false);
    }
  };

  // Преобразуем матчи из БД в формат для турнирной сетки
  const convertToScheduleMatch = (match: DBMatch): Match => {
    return {
      id: match.match_number,
      team1: match.team1_name || match.team1_placeholder || 'TBD',
      team2: match.team2_name || match.team2_placeholder || 'TBD',
      score1: match.score1,
      score2: match.score2,
      winner: match.winner as 1 | 2 | undefined,
      status: match.status as 'upcoming' | 'live' | 'finished',
      time: match.scheduled_time 
        ? new Date(match.scheduled_time).toLocaleString('ru-RU', {
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit'
          })
        : 'TBD',
      round: `${match.bracket_type === 'upper' ? 'Верхняя сетка' : match.bracket_type === 'lower' ? 'Нижняя сетка' : 'Гранд Финал'} Раунд ${match.round_number}`,
    };
  };

  // Группируем матчи по типу сетки и раунду
  const upperBracketRounds: any[][] = [];
  const lowerBracketRounds: any[][] = [];
  let grandFinals: any = null;

  if (dbMatches.length > 0) {
    // Находим максимальный номер раунда для каждой сетки
    const maxUpperRound = Math.max(
      ...dbMatches.filter(m => m.bracket_type === 'upper').map(m => m.round_number),
      0
    );
    const maxLowerRound = Math.max(
      ...dbMatches.filter(m => m.bracket_type === 'lower').map(m => m.round_number),
      0
    );

    // Заполняем верхнюю сетку
    for (let i = 1; i <= maxUpperRound; i++) {
      const roundMatches = dbMatches
        .filter(m => m.bracket_type === 'upper' && m.round_number === i)
        .sort((a, b) => a.match_number - b.match_number)
        .map(m => ({
          id: m.match_number,
          team1: m.team1_name || m.team1_placeholder || 'TBD',
          team2: m.team2_name || m.team2_placeholder || 'TBD',
          score1: m.score1,
          score2: m.score2,
          winner: m.winner,
        }));
      if (roundMatches.length > 0) {
        upperBracketRounds.push(roundMatches);
      }
    }

    // Заполняем нижнюю сетку
    for (let i = 1; i <= maxLowerRound; i++) {
      const roundMatches = dbMatches
        .filter(m => m.bracket_type === 'lower' && m.round_number === i)
        .sort((a, b) => a.match_number - b.match_number)
        .map(m => ({
          id: m.match_number,
          team1: m.team1_name || m.team1_placeholder || 'TBD',
          team2: m.team2_name || m.team2_placeholder || 'TBD',
          score1: m.score1,
          score2: m.score2,
          winner: m.winner,
        }));
      if (roundMatches.length > 0) {
        lowerBracketRounds.push(roundMatches);
      }
    }

    // Гранд финал
    const finalMatch = dbMatches.find(m => m.bracket_type === 'grand_final');
    if (finalMatch) {
      grandFinals = {
        id: finalMatch.match_number,
        team1: finalMatch.team1_name || finalMatch.team1_placeholder || 'TBD',
        team2: finalMatch.team2_name || finalMatch.team2_placeholder || 'TBD',
        score1: finalMatch.score1,
        score2: finalMatch.score2,
        winner: finalMatch.winner,
      };
    }
  }

  // Расписание для вкладки
  const schedule: Match[] = dbMatches
    .filter(m => m.scheduled_time)
    .sort((a, b) => new Date(a.scheduled_time!).getTime() - new Date(b.scheduled_time!).getTime())
    .map(convertToScheduleMatch);

  const getStatusBadge = (status: Match['status']) => {
    switch (status) {
      case 'live':
        return <Badge variant="destructive" className="animate-pulse">В эфире</Badge>;
      case 'finished':
        return <Badge variant="secondary">Завершён</Badge>;
      default:
        return <Badge variant="outline">Ожидается</Badge>;
    }
  };

  const MatchCard = ({ match, showRound = false }: { match: Match; showRound?: boolean }) => (
    <div className="p-4 border rounded-lg bg-card hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        {showRound && <span className="text-sm font-medium text-muted-foreground">{match.round}</span>}
        {getStatusBadge(match.status)}
      </div>
      
      <div className="space-y-2">
        <div className={`flex items-center justify-between p-2 rounded ${match.winner === 1 ? 'bg-green-500/10' : 'bg-muted/30'}`}>
          <span className="font-medium">{match.team1}</span>
          {match.score1 !== undefined && (
            <span className={`text-lg font-bold ${match.winner === 1 ? 'text-green-600' : ''}`}>{match.score1}</span>
          )}
        </div>
        <div className="text-center text-xs text-muted-foreground">vs</div>
        <div className={`flex items-center justify-between p-2 rounded ${match.winner === 2 ? 'bg-green-500/10' : 'bg-muted/30'}`}>
          <span className="font-medium">{match.team2}</span>
          {match.score2 !== undefined && (
            <span className={`text-lg font-bold ${match.winner === 2 ? 'text-green-600' : ''}`}>{match.score2}</span>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
        <Icon name="Clock" size={14} />
        <span>{match.time}</span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto animate-fade-in">
        <Card className="border-primary/20">
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center">
              <Icon name="Loader2" size={48} className="animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Загрузка турнирной сетки...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (dbMatches.length === 0) {
    return (
      <div className="max-w-7xl mx-auto animate-fade-in">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-3xl font-heading flex items-center gap-3">
              <Icon name="Trophy" size={32} className="text-primary" />
              Турнирная сетка
            </CardTitle>
            <CardDescription>Расписание матчей и турнирная сетка в формате Double Elimination</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Icon name="CalendarClock" size={64} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-xl text-muted-foreground mb-2">Сетка появится после создания матчей</p>
              <p className="text-sm text-muted-foreground">
                Администратор настроит турнирную сетку в админ-панели
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-3xl font-heading flex items-center gap-3">
            <Icon name="Trophy" size={32} className="text-primary" />
            Турнирная сетка
          </CardTitle>
          <CardDescription>Расписание матчей и турнирная сетка в формате Double Elimination</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="bracket" className="flex items-center gap-2">
                <Icon name="GitBranch" size={16} />
                Турнирная сетка
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex items-center gap-2">
                <Icon name="Calendar" size={16} />
                Расписание
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bracket" className="space-y-8">
              <TournamentBracket 
                upperMatches={upperBracketRounds}
                lowerMatches={lowerBracketRounds}
                finals={grandFinals}
              />
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Icon name="CalendarDays" size={20} className="text-primary" />
                <h3 className="text-xl font-semibold">Расписание матчей</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                {schedule.map((match) => (
                  <MatchCard key={match.id} match={match} showRound />
                ))}
              </div>

              {schedule.length === 0 && (
                <div className="text-center py-12">
                  <Icon name="CalendarClock" size={64} className="text-muted-foreground mx-auto mb-4" />
                  <p className="text-xl text-muted-foreground mb-2">Расписание появится позже</p>
                  <p className="text-sm text-muted-foreground">Следите за обновлениями</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}