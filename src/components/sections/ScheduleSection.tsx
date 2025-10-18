import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import TournamentBracket from '@/components/TournamentBracket';

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

export default function ScheduleSection() {
  const [activeTab, setActiveTab] = useState('bracket');

  // Верхняя сетка по раундам
  const upperBracketRounds = [
    // Round 1 (8 команд -> 4 матча)
    [
      { id: 8, team1: 'Theartofwar "Talent" - Jab', team2: 'Phyah "LebronJames" - Ze', score1: 2, score2: 0, winner: 1 as const },
      { id: 4, team1: 'GoW_T "Kungfu" - Zeal', team2: 'Scorchie "Zaldarius" - Zeal', score1: 2, score2: 1, winner: 1 as const },
      { id: 5, team1: 'Blowjay "Blowski" - Conc', team2: 'Leh "Marvel" - Jab', score1: 2, score2: 0, winner: 1 as const },
      { id: 2, team1: 'Max_edt "Koo-teha" - Conc', team2: 'Dougfluie "Kurupt" - Zeal', score1: 2, score2: 1, winner: 1 as const },
    ],
    // Round 2 (4 команды -> 2 матча)
    [
      { id: 12, team1: 'Slownoma "Joint" - Zeal', team2: 'Winner of 8' },
      { id: 13, team1: 'Winner of 5', team2: 'Winner of 2' },
    ],
    // Round 3 (2 команды -> 1 матч)
    [
      { id: 21, team1: 'Winner of 12', team2: 'Winner of 13' },
    ],
    // Semifinals
    [
      { id: 25, team1: 'Winner of 21', team2: 'Winner of Loser 26' },
    ],
  ];

  // Нижняя сетка по раундам
  const lowerBracketRounds = [
    // Loser Round 1
    [
      { id: 15, team1: 'Loser of 2', team2: 'Loser of 3' },
      { id: 16, team1: 'Loser of 4', team2: 'Loser of 5' },
    ],
    // Loser Round 2
    [
      { id: 17, team1: 'Loser of 13', team2: 'Loser of 1' },
      { id: 18, team1: 'Loser of 14', team2: 'Winner of 15' },
    ],
    // Loser Round 3
    [
      { id: 20, team1: 'Loser of 12', team2: 'Winner of 18' },
      { id: 23, team1: 'Winner of 17', team2: 'Winner of 16' },
    ],
    // Loser Round 4
    [
      { id: 24, team1: 'Loser of 21', team2: 'Winner of 23' },
    ],
    // Loser Round 5
    [
      { id: 26, team1: 'Loser of 22', team2: 'Winner of 24' },
    ],
    // Loser Round 6
    [
      { id: 27, team1: 'Winner of 26', team2: 'Loser of 28' },
    ],
  ];

  // Гранд финал
  const grandFinals = {
    id: 28,
    team1: 'Winner of 25',
    team2: 'Winner of Loser Bracket',
  };

  // Расписание матчей
  const schedule: Match[] = [
    { id: 8, team1: 'Theartofwar "Talent"', team2: 'Phyah "LebronJames"', round: 'Round 1', time: '19 октября, 14:00', status: 'finished', score1: 2, score2: 0, winner: 1 },
    { id: 4, team1: 'GoW_T "Kungfu"', team2: 'Scorchie "Zaldarius"', round: 'Round 1', time: '19 октября, 14:30', status: 'finished', score1: 2, score2: 1, winner: 1 },
    { id: 5, team1: 'Blowjay "Blowski"', team2: 'Leh "Marvel"', round: 'Round 1', time: '19 октября, 15:00', status: 'finished', score1: 2, score2: 0, winner: 1 },
    { id: 2, team1: 'Max_edt "Koo-teha"', team2: 'Dougfluie "Kurupt"', round: 'Round 1', time: '19 октября, 15:30', status: 'finished', score1: 2, score2: 1, winner: 1 },
    { id: 12, team1: 'Slownoma "Joint"', team2: 'Winner of 8', round: 'Round 2', time: '19 октября, 16:00', status: 'upcoming' },
    { id: 13, team1: 'Winner of 5', team2: 'Winner of 2', round: 'Round 2', time: '19 октября, 16:30', status: 'upcoming' },
  ];

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
