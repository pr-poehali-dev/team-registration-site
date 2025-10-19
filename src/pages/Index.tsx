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
import funcUrls from '../../backend/func2url.json';

const API_URL = funcUrls.teams;
const AUTH_URL = funcUrls['admin-auth'];
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

type Section = 'register' | 'teams' | 'schedule' | 'manage' | 'admin';

export default function Index() {
  const [activeSection, setActiveSection] = useState<Section>('register');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminToken, setAdminToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadRegistrationStatus();
  }, []);

  useEffect(() => {
    loadTeams();
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
        headers: { 
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken
        },
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
    
    const submissionData = {
      team_name: formData.team_name,
      captain_name: formData.captain_name,
      captain_telegram: formData.captain_telegram,
      top_player: formData.top_player,
      top_telegram: formData.top_telegram,
      jungle_player: formData.jungle_player,
      jungle_telegram: formData.jungle_telegram,
      mid_player: formData.mid_player,
      mid_telegram: formData.mid_telegram,
      adc_player: formData.adc_player,
      adc_telegram: formData.adc_telegram,
      support_player: formData.support_player,
      support_telegram: formData.support_telegram,
      sub1_player: formData.sub1_player,
      sub1_telegram: formData.sub1_telegram,
      sub2_player: formData.sub2_player,
      sub2_telegram: formData.sub2_telegram
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
        let errorMessage = "Не удалось отправить заявку";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          // Если не удалось распарсить JSON, используем статус
          if (response.status === 409) {
            errorMessage = "Вы уже зарегистрировали команду. Один человек может зарегистрировать только одну команду.";
          }
        }
        
        toast({
          title: "Ошибка регистрации",
          description: errorMessage,
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
      const url = isAdmin ? `${API_URL}?status=all` : API_URL;
      const response = await fetch(url);
      const data = await response.json();
      setTeams(data.teams || []);
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
        headers: { 
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken
        },
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
        method: 'DELETE',
        headers: {
          'X-Admin-Token': adminToken
        }
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
        setAdminToken(data.token || data.username);
        setIsSuperAdmin(data.is_superadmin || false);
        toast({
          title: "Успешный вход",
          description: "Добро пожаловать в админ-панель",
        });
        loadTeams();
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
            adminToken={adminToken}
            isRegistrationOpen={isRegistrationOpen}
            isLoadingSettings={isLoadingSettings}
            onToggleRegistration={handleToggleRegistration}
            onTeamsUpdated={loadTeams}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}