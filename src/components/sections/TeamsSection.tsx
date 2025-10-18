import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import funcUrls from '../../../backend/func2url.json';

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
}

interface TeamsSectionProps {
  teams: Team[];
  isAdmin: boolean;
  onLoadTeams: () => void;
  onStatusChange: (teamId: number, newStatus: 'approved' | 'rejected') => void;
  onDeleteTeam: (teamId: number) => void;
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

export default function TeamsSection({ teams, isAdmin, onLoadTeams, onStatusChange, onDeleteTeam }: TeamsSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isAdmin) {
      loadRegistrationStatus();
    }
  }, [isAdmin]);

  const loadRegistrationStatus = async () => {
    try {
      const response = await fetch(SETTINGS_URL);
      const data = await response.json();
      setIsRegistrationOpen(data.is_open);
    } catch (error) {
      console.error('Failed to load registration status:', error);
    }
  };

  const handleToggleRegistration = async () => {
    setIsLoadingSettings(true);
    try {
      const response = await fetch(SETTINGS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_open: !isRegistrationOpen,
          updated_by: 'admin'
        })
      });

      if (response.ok) {
        setIsRegistrationOpen(!isRegistrationOpen);
        toast({
          title: isRegistrationOpen ? "Регистрация закрыта" : "Регистрация открыта",
          description: isRegistrationOpen 
            ? "Капитаны больше не могут редактировать команды" 
            : "Капитаны могут редактировать свои команды"
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось изменить статус регистрации",
        variant: "destructive"
      });
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const filteredTeams = teams.filter(team => 
    team.team_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.captain_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const approvedTeams = filteredTeams.filter(team => team.status === 'approved');
  const pendingTeams = filteredTeams.filter(team => team.status === 'pending');
  const rejectedTeams = filteredTeams.filter(team => team.status === 'rejected');

  const formatMembersInfo = (membersInfo: string, showTelegram: boolean): string[] => {
    if (!membersInfo) return [];
    
    return membersInfo.split('\n').filter(line => line.trim()).map(line => {
      if (showTelegram) {
        return line.trim();
      } else {
        // Убираем всё после " - Телеграм:"
        return line.split(' - Телеграм:')[0].trim();
      }
    });
  };

  const handleEditTeam = (team: Team) => {
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
      const response = await fetch(`https://functions.poehali.dev/770caae7-f99a-46a7-9d02-36b5270e76fe`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingTeam.id,
          team_name: editFormData.team_name,
          captain_name: editFormData.captain_name,
          captain_telegram: editFormData.captain_telegram,
          members_info: membersInfo
        })
      });

      if (response.ok) {
        toast({
          title: "Состав обновлён",
          description: "Изменения успешно сохранены"
        });
        setIsEditDialogOpen(false);
        onLoadTeams();
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить состав команды",
        variant: "destructive"
      });
    }
  };

  const handleExportToExcel = () => {
    const exportData = filteredTeams.map(team => ({
      'Название команды': team.team_name,
      'Капитан': team.captain_name,
      'Telegram': team.captain_telegram,
      'Участников': team.members_count,
      'Статус': team.status === 'approved' ? 'Одобрена' : team.status === 'rejected' ? 'Отклонена' : 'На модерации',
      'Состав': team.members_info,
      'Дата регистрации': new Date(team.created_at).toLocaleDateString('ru-RU')
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Команды');
    XLSX.writeFile(workbook, `команды_${new Date().toLocaleDateString('ru-RU')}.xlsx`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-heading font-bold">Зарегистрированные команды</h2>
        <div className="flex gap-2">
          {isAdmin && (
            <Button onClick={handleExportToExcel} variant="outline">
              <Icon name="Download" size={18} className="mr-2" />
              Экспорт в Excel
            </Button>
          )}
          <Button onClick={onLoadTeams} variant="outline">
            <Icon name="RefreshCw" size={18} className="mr-2" />
            Обновить
          </Button>
        </div>
      </div>

      <div className="relative">
        <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Поиск по названию команды или капитану..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {isAdmin && (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="all">Все</TabsTrigger>
            <TabsTrigger value="pending">Ожидают</TabsTrigger>
            <TabsTrigger value="approved">Одобрены</TabsTrigger>
            <TabsTrigger value="rejected">Отклонены</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            {filteredTeams.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Icon name="Inbox" size={48} className="text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Нет зарегистрированных команд</p>
                </CardContent>
              </Card>
            ) : (
              filteredTeams.map((team) => (
                <Card key={team.id} className="border-primary/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="font-heading flex items-center gap-3">
                          {team.team_name}
                          <Badge variant={
                            team.status === 'approved' ? 'default' : 
                            team.status === 'rejected' ? 'destructive' : 'secondary'
                          }>
                            {team.status === 'pending' && 'На модерации'}
                            {team.status === 'approved' && 'Одобрена'}
                            {team.status === 'rejected' && 'Отклонена'}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          Капитан: {team.captain_name} • Участников: {team.members_count}
                        </CardDescription>
                      </div>
                      {isAdmin && (
                        <div className="flex gap-2">
                          {team.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => onStatusChange(team.id, 'approved')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Icon name="Check" size={16} className="mr-1" />
                                Одобрить
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => onStatusChange(team.id, 'rejected')}
                              >
                                <Icon name="X" size={16} className="mr-1" />
                                Отклонить
                              </Button>
                            </>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditTeam(team)}
                          >
                            <Icon name="Edit" size={16} className="mr-1" />
                            Изменить
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => onDeleteTeam(team.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Icon name="Trash2" size={16} className="mr-1" />
                            Удалить
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Telegram:</span> {team.captain_telegram}
                    </div>
                    {team.members_info && (
                      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm font-medium mb-2">Состав команды:</p>
                        <div className="space-y-1">
                          {formatMembersInfo(team.members_info, true).map((member, idx) => (
                            <p key={idx} className="text-sm text-muted-foreground">{member}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4 mt-6">
            {pendingTeams.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Icon name="Clock" size={48} className="text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Нет команд на модерации</p>
                </CardContent>
              </Card>
            ) : (
              pendingTeams.map((team) => (
                <Card key={team.id} className="border-primary/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="font-heading flex items-center gap-3">
                          {team.team_name}
                          <Badge variant="secondary">На модерации</Badge>
                        </CardTitle>
                        <CardDescription>
                          Капитан: {team.captain_name} • Участников: {team.members_count}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => onStatusChange(team.id, 'approved')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Icon name="Check" size={16} className="mr-1" />
                          Одобрить
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => onStatusChange(team.id, 'rejected')}
                        >
                          <Icon name="X" size={16} className="mr-1" />
                          Отклонить
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Telegram:</span> {team.captain_telegram}
                    </div>
                    {team.members_info && (
                      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm font-medium mb-2">Состав команды:</p>
                        <div className="space-y-1">
                          {formatMembersInfo(team.members_info, true).map((member, idx) => (
                            <p key={idx} className="text-sm text-muted-foreground">{member}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4 mt-6">
            {approvedTeams.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Icon name="CheckCircle" size={48} className="text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Нет одобренных команд</p>
                </CardContent>
              </Card>
            ) : (
              approvedTeams.map((team) => (
                <Card key={team.id} className="border-primary/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="font-heading flex items-center gap-3">
                          {team.team_name}
                          <Badge>Одобрена</Badge>
                        </CardTitle>
                        <CardDescription>
                          Капитан: {team.captain_name} • Участников: {team.members_count}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Telegram:</span> {team.captain_telegram}
                    </div>
                    {team.members_info && (
                      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm font-medium mb-2">Состав команды:</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">{team.members_info}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4 mt-6">
            {rejectedTeams.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Icon name="XCircle" size={48} className="text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Нет отклоненных команд</p>
                </CardContent>
              </Card>
            ) : (
              rejectedTeams.map((team) => (
                <Card key={team.id} className="border-destructive/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="font-heading flex items-center gap-3">
                          {team.team_name}
                          <Badge variant="destructive">Отклонена</Badge>
                        </CardTitle>
                        <CardDescription>
                          Капитан: {team.captain_name} • Участников: {team.members_count}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Telegram:</span> {team.captain_telegram}
                    </div>
                    {team.members_info && (
                      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm font-medium mb-2">Состав команды:</p>
                        <div className="space-y-1">
                          {formatMembersInfo(team.members_info, true).map((member, idx) => (
                            <p key={idx} className="text-sm text-muted-foreground">{member}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      )}

      {!isAdmin && (
        <div className="space-y-4">
          {approvedTeams.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Icon name="Users" size={48} className="text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Пока нет одобренных команд</p>
              </CardContent>
            </Card>
          ) : (
            approvedTeams.map((team) => (
              <Card key={team.id} className="border-primary/20">
                <CardHeader>
                  <div>
                    <CardTitle className="font-heading flex items-center gap-3">
                      {team.team_name}
                      <Badge>Участвует</Badge>
                    </CardTitle>
                    <CardDescription>
                      Капитан: {team.captain_name} • Участников: {team.members_count}
                    </CardDescription>
                  </div>
                </CardHeader>
                {team.members_info && (
                  <CardContent>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium mb-2">Состав команды:</p>
                      <div className="space-y-1">
                        {formatMembersInfo(team.members_info, false).map((member, idx) => (
                          <p key={idx} className="text-sm text-muted-foreground">{member}</p>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
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
                Сохранить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}