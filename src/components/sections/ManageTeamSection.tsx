import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import funcUrls from '../../../backend/func2url.json';

const API_URL = funcUrls.teams;
const SETTINGS_URL = funcUrls['registration-settings'];

interface Team {
  id: number;
  team_name: string;
  captain_name: string;
  captain_telegram: string;
  members_count: number;
  members_info: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_comment: string;
  created_at: string;
  auth_code: string;
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

export default function ManageTeamSection() {
  const [captainTelegram, setCaptainTelegram] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [team, setTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [showAuthInput, setShowAuthInput] = useState(false);
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
    loadRegistrationStatus();
  }, []);

  const loadRegistrationStatus = async () => {
    try {
      const response = await fetch(SETTINGS_URL);
      const data = await response.json();
      setIsRegistrationOpen(data.is_open);
    } catch (error) {
      console.error('Failed to load registration status:', error);
    }
  };

  const handleFindTeam = async () => {
    if (!captainTelegram.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите ваш Telegram",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}?captain_telegram=${encodeURIComponent(captainTelegram)}`);
      const data = await response.json();
      
      if (data.team) {
        setTeam(data.team);
        setShowAuthInput(true);
        toast({
          title: "Команда найдена",
          description: `Команда "${data.team.team_name}" найдена. Введите код для доступа`
        });
      } else {
        setTeam(null);
        setShowAuthInput(false);
        toast({
          title: "Команда не найдена",
          description: "У вас нет зарегистрированной команды",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось найти команду",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTeam = () => {
    if (!team) return;

    if (!isRegistrationOpen) {
      toast({
        title: "Редактирование недоступно",
        description: "Регистрация завершена. Изменение команд больше не доступно.",
        variant: "destructive"
      });
      return;
    }

    const lines = team.members_info.split('\n');
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

    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!team || !authCode) {
      toast({
        title: "Ошибка",
        description: "Введите код авторизации",
        variant: "destructive"
      });
      return;
    }

    const membersInfo = [
      `Топ: ${editFormData.top_player} - Телеграм: ${editFormData.top_telegram}`,
      `Лес: ${editFormData.jungle_player} - Телеграм: ${editFormData.jungle_telegram}`,
      `Мид: ${editFormData.mid_player} - Телеграм: ${editFormData.mid_telegram}`,
      `АДК: ${editFormData.adc_player} - Телеграм: ${editFormData.adc_telegram}`,
      `Саппорт: ${editFormData.support_player} - Телеграм: ${editFormData.support_telegram}`
    ].join('\n');

    try {
      const response = await fetch(API_URL, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: team.id,
          team_name: editFormData.team_name,
          captain_name: editFormData.captain_name,
          captain_telegram: editFormData.captain_telegram,
          members_info: membersInfo,
          auth_code: authCode
        })
      });

      if (response.ok) {
        toast({
          title: "Команда обновлена",
          description: "Изменения успешно сохранены"
        });
        setIsEditDialogOpen(false);
        setCaptainTelegram(editFormData.captain_telegram);
        handleFindTeam();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Update failed');
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось обновить команду",
        variant: "destructive"
      });
    }
  };

  const handleCancelRegistration = async () => {
    if (!team || !authCode) {
      toast({
        title: "Ошибка",
        description: "Введите код авторизации",
        variant: "destructive"
      });
      return;
    }

    if (!isRegistrationOpen) {
      toast({
        title: "Отмена недоступна",
        description: "Регистрация завершена. Отмена регистрации больше не доступна.",
        variant: "destructive"
      });
      return;
    }

    if (!confirm('Вы уверены, что хотите отменить регистрацию команды? Это действие нельзя отменить.')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}?id=${team.id}&auth_code=${encodeURIComponent(authCode)}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: "Регистрация отменена",
          description: "Ваша команда удалена из системы"
        });
        setTeam(null);
        setCaptainTelegram('');
        setAuthCode('');
        setShowAuthInput(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Delete failed');
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось отменить регистрацию",
        variant: "destructive"
      });
    }
  };

  const formatMembersInfo = (membersInfo: string): string[] => {
    if (!membersInfo) return [];
    return membersInfo.split('\n').filter(line => line.trim()).map(line => line.trim());
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-heading font-bold">Управление командой</h1>
        <p className="text-muted-foreground">
          Найдите свою команду по Telegram капитана, чтобы редактировать или отменить регистрацию
        </p>
      </div>

      {!isRegistrationOpen && (
        <Card className="border-orange-500/50 bg-orange-500/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Icon name="AlertCircle" size={24} className="text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-500 mb-1">Регистрация завершена</h3>
                <p className="text-sm text-muted-foreground">
                  Период регистрации закрыт. Редактирование и отмена регистрации команд больше не доступны.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Найти мою команду</CardTitle>
          <CardDescription>Введите Telegram, который вы указали при регистрации</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="@username"
                value={captainTelegram}
                onChange={(e) => setCaptainTelegram(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFindTeam()}
              />
            </div>
            <Button onClick={handleFindTeam} disabled={isLoading}>
              <Icon name="Search" size={16} className="mr-2" />
              {isLoading ? 'Поиск...' : 'Найти'}
            </Button>
          </div>
          
          {showAuthInput && (
            <div className="space-y-2">
              <Label htmlFor="auth_code">Код авторизации</Label>
              <Input
                id="auth_code"
                placeholder="Введите 6-значный код"
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value.toUpperCase())}
                maxLength={6}
              />
              <p className="text-sm text-muted-foreground">
                Код был выдан вам при регистрации команды. Без него вы не сможете редактировать команду.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {team && (
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="font-heading">{team.team_name}</CardTitle>
                <CardDescription>
                  Капитан: {team.captain_name} • Статус: {
                    team.status === 'pending' ? 'На модерации' :
                    team.status === 'approved' ? 'Одобрена' : 'Отклонена'
                  }
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={handleEditTeam}
                  disabled={!isRegistrationOpen}
                >
                  <Icon name="Edit" size={16} className="mr-1" />
                  Редактировать
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={handleCancelRegistration}
                  disabled={!isRegistrationOpen}
                >
                  <Icon name="Trash2" size={16} className="mr-1" />
                  Отменить регистрацию
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm mb-4">
              <span className="text-muted-foreground">Telegram капитана:</span> {team.captain_telegram}
            </div>
            {team.members_info && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-2">Состав команды:</p>
                <div className="space-y-1">
                  {formatMembersInfo(team.members_info).map((member, idx) => (
                    <p key={idx} className="text-sm text-muted-foreground">{member}</p>
                  ))}
                </div>
              </div>
            )}
            {team.admin_comment && (
              <div className="mt-4 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                <p className="text-sm font-medium mb-1">Комментарий администратора:</p>
                <p className="text-sm text-muted-foreground">{team.admin_comment}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать команду</DialogTitle>
            <DialogDescription>
              Изменение информации о команде и составе
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Название команды</Label>
              <Input
                value={editFormData.team_name}
                onChange={(e) => setEditFormData({...editFormData, team_name: e.target.value})}
                placeholder="Название команды"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ник капитана</Label>
                <Input
                  value={editFormData.captain_name}
                  onChange={(e) => setEditFormData({...editFormData, captain_name: e.target.value})}
                  placeholder="Ник капитана"
                />
              </div>
              <div className="space-y-2">
                <Label>Telegram капитана</Label>
                <Input
                  value={editFormData.captain_telegram}
                  onChange={(e) => setEditFormData({...editFormData, captain_telegram: e.target.value})}
                  placeholder="@username"
                />
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <p className="text-sm font-medium mb-4">Состав команды</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Топ</Label>
                <Input
                  value={editFormData.top_player}
                  onChange={(e) => setEditFormData({...editFormData, top_player: e.target.value})}
                  placeholder="Ник игрока"
                />
              </div>
              <div className="space-y-2">
                <Label>Telegram топа</Label>
                <Input
                  value={editFormData.top_telegram}
                  onChange={(e) => setEditFormData({...editFormData, top_telegram: e.target.value})}
                  placeholder="@username"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Лес</Label>
                <Input
                  value={editFormData.jungle_player}
                  onChange={(e) => setEditFormData({...editFormData, jungle_player: e.target.value})}
                  placeholder="Ник игрока"
                />
              </div>
              <div className="space-y-2">
                <Label>Telegram леса</Label>
                <Input
                  value={editFormData.jungle_telegram}
                  onChange={(e) => setEditFormData({...editFormData, jungle_telegram: e.target.value})}
                  placeholder="@username"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Мид</Label>
                <Input
                  value={editFormData.mid_player}
                  onChange={(e) => setEditFormData({...editFormData, mid_player: e.target.value})}
                  placeholder="Ник игрока"
                />
              </div>
              <div className="space-y-2">
                <Label>Telegram мида</Label>
                <Input
                  value={editFormData.mid_telegram}
                  onChange={(e) => setEditFormData({...editFormData, mid_telegram: e.target.value})}
                  placeholder="@username"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>АДК</Label>
                <Input
                  value={editFormData.adc_player}
                  onChange={(e) => setEditFormData({...editFormData, adc_player: e.target.value})}
                  placeholder="Ник игрока"
                />
              </div>
              <div className="space-y-2">
                <Label>Telegram АДК</Label>
                <Input
                  value={editFormData.adc_telegram}
                  onChange={(e) => setEditFormData({...editFormData, adc_telegram: e.target.value})}
                  placeholder="@username"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Саппорт</Label>
                <Input
                  value={editFormData.support_player}
                  onChange={(e) => setEditFormData({...editFormData, support_player: e.target.value})}
                  placeholder="Ник игрока"
                />
              </div>
              <div className="space-y-2">
                <Label>Telegram саппорта</Label>
                <Input
                  value={editFormData.support_telegram}
                  onChange={(e) => setEditFormData({...editFormData, support_telegram: e.target.value})}
                  placeholder="@username"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleSaveEdit}>
                Сохранить изменения
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}