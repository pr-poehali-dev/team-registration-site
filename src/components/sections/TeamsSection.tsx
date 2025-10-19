import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import funcUrls from '../../../backend/func2url.json';
import TeamCard from '@/components/teams/TeamCard';
import TeamEditDialog from '@/components/teams/TeamEditDialog';
import PublicTeamCard from '@/components/teams/PublicTeamCard';

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
  sub1_player: string;
  sub1_telegram: string;
  sub2_player: string;
  sub2_telegram: string;
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
    support_telegram: '',
    sub1_player: '',
    sub1_telegram: '',
    sub2_player: '',
    sub2_telegram: ''
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
    const sub1 = parseRole(lines[5] || '');
    const sub2 = parseRole(lines[6] || '');

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
      support_telegram: support.telegram,
      sub1_player: sub1.playerName,
      sub1_telegram: sub1.telegram,
      sub2_player: sub2.playerName,
      sub2_telegram: sub2.telegram
    });

    setEditingTeam(team);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingTeam) return;

    const members = [
      `Топ: ${editFormData.top_player} - Телеграм: ${editFormData.top_telegram}`,
      `Лес: ${editFormData.jungle_player} - Телеграм: ${editFormData.jungle_telegram}`,
      `Мид: ${editFormData.mid_player} - Телеграм: ${editFormData.mid_telegram}`,
      `АДК: ${editFormData.adc_player} - Телеграм: ${editFormData.adc_telegram}`,
      `Саппорт: ${editFormData.support_player} - Телеграм: ${editFormData.support_telegram}`
    ];
    
    if (editFormData.sub1_player && editFormData.sub1_telegram) {
      members.push(`Запасной 1: ${editFormData.sub1_player} - Телеграм: ${editFormData.sub1_telegram}`);
    }
    if (editFormData.sub2_player && editFormData.sub2_telegram) {
      members.push(`Запасной 2: ${editFormData.sub2_player} - Телеграм: ${editFormData.sub2_telegram}`);
    }
    
    const membersInfo = members.join('\n');

    try {
      const response = await fetch(`https://ce876244.tw1.ru/php-backend/api/teams.php`, {
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
                <TeamCard
                  key={team.id}
                  team={team}
                  isAdmin={isAdmin}
                  formatMembersInfo={formatMembersInfo}
                  onStatusChange={onStatusChange}
                  onDeleteTeam={onDeleteTeam}
                  onEditTeam={handleEditTeam}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4 mt-6">
            {pendingTeams.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Icon name="Inbox" size={48} className="text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Нет команд на модерации</p>
                </CardContent>
              </Card>
            ) : (
              pendingTeams.map((team) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  isAdmin={isAdmin}
                  formatMembersInfo={formatMembersInfo}
                  onStatusChange={onStatusChange}
                  onDeleteTeam={onDeleteTeam}
                  onEditTeam={handleEditTeam}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4 mt-6">
            {approvedTeams.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Icon name="Inbox" size={48} className="text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Нет одобренных команд</p>
                </CardContent>
              </Card>
            ) : (
              approvedTeams.map((team) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  isAdmin={isAdmin}
                  formatMembersInfo={formatMembersInfo}
                  onStatusChange={onStatusChange}
                  onDeleteTeam={onDeleteTeam}
                  onEditTeam={handleEditTeam}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4 mt-6">
            {rejectedTeams.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Icon name="Inbox" size={48} className="text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Нет отклонённых команд</p>
                </CardContent>
              </Card>
            ) : (
              rejectedTeams.map((team) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  isAdmin={isAdmin}
                  formatMembersInfo={formatMembersInfo}
                  onStatusChange={onStatusChange}
                  onDeleteTeam={onDeleteTeam}
                  onEditTeam={handleEditTeam}
                />
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
                <Icon name="Inbox" size={48} className="text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Пока нет одобренных команд</p>
              </CardContent>
            </Card>
          ) : (
            approvedTeams.map((team) => (
              <PublicTeamCard
                key={team.id}
                team={team}
                formatMembersInfo={formatMembersInfo}
              />
            ))
          )}
        </div>
      )}

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