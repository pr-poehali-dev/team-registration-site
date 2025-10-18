import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import funcUrls from '../../../backend/func2url.json';
import TeamSearchCard from '@/components/manage-team/TeamSearchCard';
import TeamDetailsCard from '@/components/manage-team/TeamDetailsCard';
import EditTeamDialog from '@/components/manage-team/EditTeamDialog';
import RegistrationClosedAlert from '@/components/manage-team/RegistrationClosedAlert';

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
  const [team, setTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
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
        toast({
          title: "Команда найдена",
          description: `Команда "${data.team.team_name}" загружена`
        });
      } else {
        setTeam(null);
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
    if (!team) return;

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
          members_info: membersInfo
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

  const handleCancelRegistration = async () => {
    if (!team) return;

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
      const response = await fetch(`${API_URL}?id=${team.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: "Регистрация отменена",
          description: "Ваша команда удалена из системы"
        });
        setTeam(null);
        setCaptainTelegram('');
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось отменить регистрацию",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-heading font-bold">Управление командой</h1>
        <p className="text-muted-foreground">
          Найдите свою команду по Telegram капитана, чтобы редактировать или отменить регистрацию
        </p>
      </div>

      {!isRegistrationOpen && <RegistrationClosedAlert />}

      <TeamSearchCard
        captainTelegram={captainTelegram}
        isLoading={isLoading}
        onCaptainTelegramChange={setCaptainTelegram}
        onSearch={handleFindTeam}
      />

      {team && (
        <TeamDetailsCard
          team={team}
          isRegistrationOpen={isRegistrationOpen}
          onEdit={handleEditTeam}
          onCancel={handleCancelRegistration}
        />
      )}

      <EditTeamDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        formData={editFormData}
        onFormDataChange={setEditFormData}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
