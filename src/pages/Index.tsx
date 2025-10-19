import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import RegisterSection from '@/components/sections/RegisterSection';
import TeamsSection from '@/components/sections/TeamsSection';
import ScheduleSection from '@/components/sections/ScheduleSection';
import ManageTeamSection from '@/components/sections/ManageTeamSection';
import AdminSection from '@/components/sections/AdminSection';
import AdminLogin from '@/components/AdminLogin';
const API_URL = '/php-backend/api/teams.php';
const AUTH_URL = '/php-backend/api/admin-auth.php';
const SETTINGS_URL = '/php-backend/api/registration-settings.php';

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

type Section = 'register' | 'teams' | 'schedule' | 'manage' | 'admin';

export default function Index() {
  const [activeSection, setActiveSection] = useState<Section>('register');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
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

  const [formData, setFormData] = useState({
    team_name: '',
    captain_name: '',
    captain_telegram: '',
    members_count: '5',
    members_info: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const membersInfo = `TOP: ${formData.top_player} (${formData.top_telegram})
JUNGLE: ${formData.jungle_player} (${formData.jungle_telegram})
MID: ${formData.mid_player} (${formData.mid_telegram})
ADC: ${formData.adc_player} (${formData.adc_telegram})
SUPPORT: ${formData.support_player} (${formData.support_telegram})
SUB1: ${formData.sub1_player} (${formData.sub1_telegram})
SUB2: ${formData.sub2_player} (${formData.sub2_telegram})`;
    
    const submissionData = {
      team_name: formData.team_name,
      captain_name: formData.captain_name,
      captain_telegram: formData.captain_telegram,
      members_count: 7,
      members_info: membersInfo
    };
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });
      
      if (response.ok) {
        const data = await response.json();
        
        toast({
          title: "✅ Команда зарегистрирована!",
          description: `Ваш код регистрации: ${data.auth_code}. Сохраните его для управления командой.`,
          duration: 10000,
        });
        
        setFormData({
          team_name: '',
          captain_name: '',
          captain_telegram: '',
          members_count: '5',
          members_info: '',
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
      } else {
        const errorData = await response.json();
        toast({
          title: "Ошибка",
          description: errorData.error || "Не удалось отправить заявку",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Проблема с подключением к серверу",
        variant: "destructive"
      });
    }
  };

  const loadTeams = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setTeams(data.teams || []);
      toast({
        title: "Загрузка команд",
        description: "Данные обновлены",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить команды",
        variant: "destructive"
      });
    }
  };

  const handleStatusChange = async (teamId: number, newStatus: 'approved' | 'rejected') => {
    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: teamId, status: newStatus })
      });
      
      if (response.ok) {
        toast({
          title: "Статус обновлен",
          description: `Команда ${newStatus === 'approved' ? 'одобрена' : 'отклонена'}`,
        });
        loadTeams();
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTeam = async (teamId: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту команду?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}?id=${teamId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast({
          title: "Команда удалена",
          description: "Команда успешно удалена из системы",
        });
        loadTeams();
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить команду",
        variant: "destructive"
      });
    }
  };

  const handleTeamsClick = () => {
    setActiveSection('teams');
    loadTeams();
  };

  const handleAdminLogin = async (username: string, password: string) => {
    try {
      const response = await fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsAuthenticated(true);
        setIsAdmin(true);
        setAdminUsername(data.username || username);
        setIsSuperAdmin(data.is_superadmin || false);
        toast({
          title: "Успешный вход",
          description: "Добро пожаловать в админ-панель",
        });
      } else {
        toast({
          title: "Ошибка",
          description: data.message || "Неверный логин или пароль",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Проблема с подключением к серверу",
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setIsAuthenticated(false);
    setIsSuperAdmin(false);
    setAdminUsername('');
    setActiveSection('register');
    toast({
      title: "Выход выполнен",
      description: "Вы вышли из админ-панели",
    });
  };

  const handleCancelAdminLogin = () => {
    setIsAdmin(false);
    setActiveSection('register');
  };

  if (isAdmin && !isAuthenticated) {
    return <AdminLogin onLogin={handleAdminLogin} onCancel={handleCancelAdminLogin} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        activeSection={activeSection}
        isAdmin={isAdmin}
        onNavigate={setActiveSection}
        onAdminToggle={() => setIsAdmin(!isAdmin)}
        onTeamsClick={handleTeamsClick}
        onLogout={handleLogout}
      />

      <main className="container mx-auto px-2 sm:px-4 py-6 sm:py-12">
        {activeSection === 'register' && (
          <RegisterSection 
            formData={formData}
            onFormChange={setFormData}
            onSubmit={handleSubmit}
            isRegistrationOpen={isRegistrationOpen}
            isLoadingSettings={isLoadingSettings}
            onToggleRegistration={isAdmin ? handleToggleRegistration : undefined}
          />
        )}

        {activeSection === 'teams' && (
          <TeamsSection 
            teams={teams}
            isAdmin={isAdmin}
            onLoadTeams={loadTeams}
            onStatusChange={handleStatusChange}
            onDeleteTeam={handleDeleteTeam}
          />
        )}

        {activeSection === 'schedule' && (
          <ScheduleSection />
        )}

        {activeSection === 'manage' && (
          <ManageTeamSection />
        )}

        {activeSection === 'admin' && isAdmin && (
          <AdminSection 
            teams={teams} 
            onNavigate={setActiveSection}
            isSuperAdmin={isSuperAdmin}
            adminUsername={adminUsername}
            isRegistrationOpen={isRegistrationOpen}
            isLoadingSettings={isLoadingSettings}
            onToggleRegistration={handleToggleRegistration}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}