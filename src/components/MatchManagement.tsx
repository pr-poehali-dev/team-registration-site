import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import funcUrls from '../../backend/func2url.json';

const API_URL = funcUrls.teams;

interface Team {
  id: number;
  team_name: string;
}

interface Match {
  id: number;
  match_number: number;
  bracket_type: string;
  round_number: number;
  team1_id?: number;
  team2_id?: number;
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

export default function MatchManagement() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportingTeams, setExportingTeams] = useState(false);
  const { toast } = useToast();

  const loadMatches = async () => {
    try {
      const response = await fetch(`${API_URL}?resource=matches`);
      const data = await response.json();
      if (data.success) {
        setMatches(data.matches);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить матчи',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTeams = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setTeams(data);
    } catch (error) {
      console.error('Failed to load teams:', error);
    }
  };

  useEffect(() => {
    loadMatches();
    loadTeams();
  }, []);

  const handleExportTeams = async () => {
    setExportingTeams(true);
    try {
      const response = await fetch(`${API_URL}?resource=export`);
      const data = await response.json();
      
      if (data.success) {
        const csvContent = data.csv;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `teams_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: 'Успешно',
          description: `Экспортировано команд: ${data.total}`,
        });
      } else {
        toast({
          title: 'Ошибка',
          description: data.message || 'Не удалось экспортировать команды',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Проблема с подключением к серверу',
        variant: 'destructive',
      });
    } finally {
      setExportingTeams(false);
    }
  };

  const handleUpdateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch) return;

    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resource: 'match',
          match_id: selectedMatch.id,
          team1_id: selectedMatch.team1_id,
          team2_id: selectedMatch.team2_id,
          score1: selectedMatch.score1,
          score2: selectedMatch.score2,
          winner: selectedMatch.winner,
          status: selectedMatch.status,
          scheduled_time: selectedMatch.scheduled_time,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Успешно',
          description: 'Матч обновлён',
        });
        loadMatches();
        setSelectedMatch(null);
      } else {
        toast({
          title: 'Ошибка',
          description: data.message || 'Не удалось обновить матч',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Проблема с подключением к серверу',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="Loader2" size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Swords" size={24} className="text-primary" />
              <CardTitle>Управление матчами</CardTitle>
            </div>
            <Button
              onClick={handleExportTeams}
              disabled={exportingTeams}
              variant="outline"
              size="sm"
            >
              {exportingTeams ? (
                <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
              ) : (
                <Icon name="Download" size={16} className="mr-2" />
              )}
              Экспорт команд (CSV)
            </Button>
          </div>
          <CardDescription>
            Редактирование результатов матчей и обновление турнирной сетки
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Список матчей */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Список матчей</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {matches.map((match) => (
                  <div
                    key={match.id}
                    onClick={() => setSelectedMatch(match)}
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

            {/* Форма редактирования */}
            <div>
              {selectedMatch ? (
                <form onSubmit={handleUpdateMatch} className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Редактировать матч #{selectedMatch.match_number}
                  </h3>

                  <div className="space-y-2">
                    <Label>Команда 1</Label>
                    <Select
                      value={selectedMatch.team1_id?.toString() || ''}
                      onValueChange={(value) =>
                        setSelectedMatch({ ...selectedMatch, team1_id: parseInt(value) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите команду" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id.toString()}>
                            {team.team_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Команда 2</Label>
                    <Select
                      value={selectedMatch.team2_id?.toString() || ''}
                      onValueChange={(value) =>
                        setSelectedMatch({ ...selectedMatch, team2_id: parseInt(value) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите команду" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id.toString()}>
                            {team.team_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Счёт команды 1</Label>
                      <Input
                        type="number"
                        min="0"
                        value={selectedMatch.score1 || ''}
                        onChange={(e) =>
                          setSelectedMatch({
                            ...selectedMatch,
                            score1: parseInt(e.target.value) || undefined,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Счёт команды 2</Label>
                      <Input
                        type="number"
                        min="0"
                        value={selectedMatch.score2 || ''}
                        onChange={(e) =>
                          setSelectedMatch({
                            ...selectedMatch,
                            score2: parseInt(e.target.value) || undefined,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Победитель</Label>
                    <Select
                      value={selectedMatch.winner?.toString() || ''}
                      onValueChange={(value) =>
                        setSelectedMatch({
                          ...selectedMatch,
                          winner: value ? parseInt(value) : undefined,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Не определён" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Команда 1</SelectItem>
                        <SelectItem value="2">Команда 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Статус</Label>
                    <Select
                      value={selectedMatch.status}
                      onValueChange={(value) =>
                        setSelectedMatch({ ...selectedMatch, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upcoming">Ожидается</SelectItem>
                        <SelectItem value="live">В эфире</SelectItem>
                        <SelectItem value="finished">Завершён</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Время начала</Label>
                    <Input
                      type="datetime-local"
                      value={
                        selectedMatch.scheduled_time
                          ? new Date(selectedMatch.scheduled_time).toISOString().slice(0, 16)
                          : ''
                      }
                      onChange={(e) =>
                        setSelectedMatch({
                          ...selectedMatch,
                          scheduled_time: e.target.value
                            ? new Date(e.target.value).toISOString()
                            : undefined,
                        })
                      }
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      <Icon name="Save" size={18} className="mr-2" />
                      Сохранить
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSelectedMatch(null)}
                    >
                      Отмена
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Icon name="MousePointerClick" size={48} className="mx-auto mb-2" />
                  <p>Выберите матч для редактирования</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}