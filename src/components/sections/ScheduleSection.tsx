import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Match {
  id: number;
  team1: string;
  team2: string;
  score1?: number;
  score2?: number;
  status: 'upcoming' | 'live' | 'finished';
  time: string;
  round: string;
}

export default function ScheduleSection() {
  const [activeTab, setActiveTab] = useState('bracket');

  // Пример данных для верхней сетки (Winner Bracket)
  const upperBracket: Match[] = [
    { id: 1, team1: 'Team Alpha', team2: 'Team Beta', round: '1/4 финала', time: '19 октября, 14:00', status: 'upcoming' },
    { id: 2, team1: 'Team Gamma', team2: 'Team Delta', round: '1/4 финала', time: '19 октября, 15:00', status: 'upcoming' },
    { id: 3, team1: 'Team Epsilon', team2: 'Team Zeta', round: '1/4 финала', time: '19 октября, 16:00', status: 'upcoming' },
    { id: 4, team1: 'Team Eta', team2: 'Team Theta', round: '1/4 финала', time: '19 октября, 17:00', status: 'upcoming' },
  ];

  // Пример данных для нижней сетки (Loser Bracket)
  const lowerBracket: Match[] = [
    { id: 5, team1: 'TBD', team2: 'TBD', round: 'LB Round 1', time: 'TBD', status: 'upcoming' },
    { id: 6, team1: 'TBD', team2: 'TBD', round: 'LB Round 1', time: 'TBD', status: 'upcoming' },
  ];

  // Пример расписания
  const schedule: Match[] = [
    { id: 1, team1: 'Team Alpha', team2: 'Team Beta', round: '1/4 финала', time: '19 октября, 14:00', status: 'upcoming' },
    { id: 2, team1: 'Team Gamma', team2: 'Team Delta', round: '1/4 финала', time: '19 октября, 15:00', status: 'upcoming' },
    { id: 3, team1: 'Team Epsilon', team2: 'Team Zeta', round: '1/4 финала', time: '19 октября, 16:00', status: 'upcoming' },
    { id: 4, team1: 'Team Eta', team2: 'Team Theta', round: '1/4 финала', time: '19 октября, 17:00', status: 'upcoming' },
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
        <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
          <span className="font-medium">{match.team1}</span>
          {match.score1 !== undefined && (
            <span className="text-lg font-bold">{match.score1}</span>
          )}
        </div>
        <div className="text-center text-xs text-muted-foreground">vs</div>
        <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
          <span className="font-medium">{match.team2}</span>
          {match.score2 !== undefined && (
            <span className="text-lg font-bold">{match.score2}</span>
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
              {/* Верхняя сетка */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Icon name="TrendingUp" size={20} className="text-green-500" />
                  <h3 className="text-xl font-semibold">Верхняя сетка (Winner Bracket)</h3>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {upperBracket.map((match) => (
                    <MatchCard key={match.id} match={match} showRound />
                  ))}
                </div>
              </div>

              {/* Нижняя сетка */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Icon name="TrendingDown" size={20} className="text-orange-500" />
                  <h3 className="text-xl font-semibold">Нижняя сетка (Loser Bracket)</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {lowerBracket.map((match) => (
                    <MatchCard key={match.id} match={match} showRound />
                  ))}
                </div>
              </div>

              {/* Гранд финал */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Icon name="Crown" size={20} className="text-yellow-500" />
                  <h3 className="text-xl font-semibold">Гранд финал</h3>
                </div>
                <div className="max-w-md mx-auto">
                  <MatchCard 
                    match={{ 
                      id: 99, 
                      team1: 'TBD', 
                      team2: 'TBD', 
                      round: 'Гранд финал', 
                      time: 'TBD', 
                      status: 'upcoming' 
                    }} 
                  />
                </div>
              </div>
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
