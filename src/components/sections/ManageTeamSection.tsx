import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import funcUrls from '../../../backend/func2url.json';
import TeamSearchCard from '@/components/manage-team/TeamSearchCard';
import TeamDetailsCard from '@/components/manage-team/TeamDetailsCard';
import EditTeamDialog from '@/components/manage-team/EditTeamDialog';
import RegistrationClosedAlert from '@/components/manage-team/RegistrationClosedAlert';
import ConfirmDialog from '@/components/manage-team/ConfirmDialog';

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
  auth_code?: string;
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
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
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
        description: "Введите код регистрации",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}?auth_code=${encodeURIComponent(captainTelegram)}`);
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
          description: "Проверьте правильность кода регистрации",
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
          title: "Запрос отправлен",
          description: "Проверьте Telegram бота для подтверждения изменений команды"
        });
        setIsEditDialogOpen(false);
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

  const handleCancelRegistration = () => {
    if (!team) return;

    if (!isRegistrationOpen) {
      toast({
        title: "Отмена недоступна",
        description: "Регистрация завершена. Отмена регистрации больше не доступна.",
        variant: "destructive"
      });
      return;
    }

    setIsDeleteConfirmOpen(true);
  };

  const confirmCancelRegistration = async () => {
    if (!team) return;

    try {
      const response = await fetch(`${API_URL}?id=${team.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Запрос отправлен",
          description: "Проверьте Telegram бота для подтверждения удаления команды"
        });
        setIsDeleteConfirmOpen(false);
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить запрос на удаление",
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

      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-500/20 rounded-lg">
            <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="text-lg font-semibold text-blue-500">Регистрация в турнирном боте</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Для участия в турнире необходимо зарегистрироваться через Telegram бот. 
              После регистрации вы получите уникальный код, который понадобится для управления командой.
            </p>
            <a 
              href="https://t.me/TournamentWR_bot" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors mt-3"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.781-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.121.099.155.232.171.326.016.094.037.308.02.475z"/>
              </svg>
              Открыть бота
            </a>
          </div>
        </div>
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

      <ConfirmDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        title="Отменить регистрацию команды?"
        description="Вам будет отправлено сообщение в Telegram с кнопками подтверждения. Только после подтверждения команда будет удалена из системы."
        onConfirm={confirmCancelRegistration}
        confirmText="Продолжить"
        cancelText="Отмена"
        variant="destructive"
      />
    </div>
  );
}