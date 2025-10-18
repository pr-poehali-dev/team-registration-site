import { useState } from 'react';
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const { toast } = useToast();

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
        toast({
          title: "Заявка отправлена",
          description: "Ваша команда зарегистрирована и ожидает модерации",
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

  const handleAdminLogin = async (password: string) => {
    try {
      const response = await fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsAuthenticated(true);
        setIsAdmin(true);
        toast({
          title: "Успешный вход",
          description: "Добро пожаловать в админ-панель",
        });
      } else {
        toast({
          title: "Ошибка",
          description: "Неверный пароль",
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
    setActiveSection('register');
    toast({
      title: "Выход выполнен",
      description: "Вы вышли из админ-панели",
    });
  };

  if (isAdmin && !isAuthenticated) {
    return <AdminLogin onLogin={handleAdminLogin} />;
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

      <main className="container mx-auto px-4 py-12">
        {activeSection === 'register' && (
          <RegisterSection 
            formData={formData}
            onFormChange={setFormData}
            onSubmit={handleSubmit}
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
          <AdminSection />
        )}
      </main>

      <Footer />
    </div>
  );
}