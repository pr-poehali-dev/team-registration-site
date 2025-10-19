import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { API_CONFIG } from '@/config/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TeamEditDialog from '@/components/teams/TeamEditDialog';

const API_URL = API_CONFIG.TEAMS_URL;

interface Team {
  id: number;
  team_name: string;
  captain_name: string;
  captain_telegram: string;
  members_info?: string;
  current_status: 'waiting' | 'streaming' | 'playing' | 'finished';
  bracket_url?: string;
  status_updated_at?: string;
}

interface EditFormData {
  team_name: string;
  captain_name: string;
  captain_telegram: string;
  top_player: string;
  top_telegram: string;
  jungle_player: string;
  jungle_telegram: string;
  mid_player: string;
  mid_telegram: string;
  adc_player: string;
  adc_telegram: string;
  support_player: string;
  support_telegram: string;
}

interface TeamStatusManagementProps {
  adminToken: string;
}

const statusConfig = {
  waiting: { label: 'Ожидание', color: 'bg-gray-500', icon: 'Clock' },
  streaming: { label: 'На стриме', color: 'bg-purple-500', icon: 'Tv' },
  playing: { label: 'Играют', color: 'bg-green-500', icon: 'Gamepad2' },
  finished: { label: 'Завершили', color: 'bg-blue-500', icon: 'CheckCircle' },
} as const;

export default function TeamStatusManagement({ adminToken }: TeamStatusManagementProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [bracketUrl, setBracketUrl] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    team_name: '',
    captain_name: '',
    captain_telegram: '',
    top_player: '',
    top_telegram: '',
    jungle_player: '',
    jungle_telegram: '',
    mid_player: '',
    mid_telegram: '',
    adc_player: '',
    adc_telegram: '',
    support_player: '',
    support_telegram: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const response = await fetch(`${API_URL}?status=all`);
      const data = await response.json();
      setTeams(data.teams || []);
      
      if (data.teams?.length > 0 && data.teams[0].bracket_url) {
        setBracketUrl(data.teams[0].bracket_url);
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить команды",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTeamStatus = async (teamId: number, newStatus: string) => {
    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken
        },
        body: JSON.stringify({
          resource: 'team_status',
          team_id: teamId,
          current_status: newStatus
        })
      });

      if (response.ok) {
        toast({
          title: "Статус обновлен",
          description: "Капитан получит уведомление в Telegram"
        });
        loadTeams();
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус",
        variant: "destructive"
      });
    }
  };

  const updateBracketUrl = async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken
        },
        body: JSON.stringify({
          resource: 'bracket_url',
          bracket_url: bracketUrl
        })
      });

      if (response.ok) {
        toast({
          title: "Ссылка обновлена",
          description: "Все капитаны получат уведомление с новой ссылкой"
        });
        loadTeams();
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить ссылку",
        variant: "destructive"
      });
    }
  };

  const handleEditTeam = (team: Team) => {
    const lines = (team.members_info || '').split('\n');
    const parseRole = (line: string) => {
      const parts = line.split(' - Телеграм: ');
      const playerName = parts[0]?.split(': ')[1]?.trim() || '';
      const telegram = parts[1]?.trim() || '';
      return { playerName, telegram };
    };

    const top = parseRole(lines[0] || '');
    const jungle = parseRole(lines[1] || '');
    const mid = parseRole(lines[2] || '');
    const adc = parseRole(lines[3] || '');
    const support = parseRole(lines[4] || '');

    setEditFormData({
      team_name: team.team_name,
      captain_name: team.captain_name,
      captain_telegram: team.captain_telegram,
      top_player: top.playerName,
      top_telegram: top.telegram,
      jungle_player: jungle.playerName,
      jungle_telegram: jungle.telegram,
      mid_player: mid.playerName,
      mid_telegram: mid.telegram,
      adc_player: adc.playerName,
      adc_telegram: adc.telegram,
      support_player: support.playerName,
      support_telegram: support.telegram
    });

    setEditingTeam(team);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingTeam) return;

    const membersInfo = [
      `Топ: ${editFormData.top_player} - Телеграм: ${editFormData.top_telegram}`,
      `Лес: ${editFormData.jungle_player} - Телеграм: ${editFormData.jungle_telegram}`,
      `Мид: ${editFormData.mid_player} - Телеграм: ${editFormData.mid_telegram}`,
      `АДК: ${editFormData.adc_player} - Телеграм: ${editFormData.adc_telegram}`,
      `Саппорт: ${editFormData.support_player} - Телеграм: ${editFormData.support_telegram}`
    ].join('\n');

    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken
        },
        body: JSON.stringify({
          resource: 'team_edit',
          id: editingTeam.id,
          team_name: editFormData.team_name,
          captain_name: editFormData.captain_name,
          captain_telegram: editFormData.captain_telegram,
          members_info: membersInfo
        })
      });

      if (response.ok) {
        toast({
          title: "Команда обновлена",
          description: "Изменения сохранены"
        });
        setIsEditDialogOpen(false);
        loadTeams();
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить команду",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center">
            <Icon name="Loader2" size={48} className="animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Загрузка...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Link" size={24} className="text-primary" />
            Турнирная сетка
          </CardTitle>
          <CardDescription>
            Ссылка на турнирную сетку для всех участников
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="bracket-url">Ссылка на турнирную сетку</Label>
              <Input
                id="bracket-url"
                value={bracketUrl}
                onChange={(e) => setBracketUrl(e.target.value)}
                placeholder="https://challonge.com/your-tournament"
              />
            </div>
            <Button onClick={updateBracketUrl} className="mt-auto">
              <Icon name="Save" size={16} className="mr-2" />
              Сохранить
            </Button>
          </div>
          {bracketUrl && (
            <a href={bracketUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
              <Icon name="ExternalLink" size={14} />
              Открыть сетку
            </a>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Activity" size={24} className="text-primary" />
            Статусы команд
          </CardTitle>
          <CardDescription>
            Управление текущим статусом команд (капитаны получают уведомления)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {teams.map((team) => {
              const config = statusConfig[team.current_status || 'waiting'];
              return (
                <div key={team.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{team.team_name}</div>
                    <div className="text-sm text-muted-foreground">
                      Капитан: {team.captain_name} ({team.captain_telegram})
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge className={`${config.color} text-white`}>
                      <Icon name={config.icon as any} size={14} className="mr-1" />
                      {config.label}
                    </Badge>
                    
                    <Select
                      value={team.current_status || 'waiting'}
                      onValueChange={(value) => updateTeamStatus(team.id, value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="waiting">
                          <div className="flex items-center gap-2">
                            <Icon name="Clock" size={16} />
                            Ожидание
                          </div>
                        </SelectItem>
                        <SelectItem value="streaming">
                          <div className="flex items-center gap-2">
                            <Icon name="Tv" size={16} />
                            На стриме
                          </div>
                        </SelectItem>
                        <SelectItem value="playing">
                          <div className="flex items-center gap-2">
                            <Icon name="Gamepad2" size={16} />
                            Играют
                          </div>
                        </SelectItem>
                        <SelectItem value="finished">
                          <div className="flex items-center gap-2">
                            <Icon name="CheckCircle" size={16} />
                            Завершили
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditTeam(team)}
                    >
                      <Icon name="Edit" size={16} className="mr-1" />
                      Редактировать
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {teams.length === 0 && (
            <div className="text-center py-12">
              <Icon name="Users" size={64} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-xl text-muted-foreground mb-2">Нет команд</p>
              <p className="text-sm text-muted-foreground">Команды появятся после регистрации</p>
            </div>
          )}
        </CardContent>
      </Card>

      <TeamEditDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        editFormData={editFormData}
        onFormChange={setEditFormData}
        onSave={handleSaveEdit}
      />
    </div>
  );
}