import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import HomeSection from '@/components/sections/HomeSection';
import RegisterSection from '@/components/sections/RegisterSection';
import TeamsSection from '@/components/sections/TeamsSection';
import RulesSection from '@/components/sections/RulesSection';
import ContactsSection from '@/components/sections/ContactsSection';
import ScheduleSection from '@/components/sections/ScheduleSection';
import funcUrls from '../../backend/func2url.json';

const API_URL = funcUrls.teams;

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

type Section = 'home' | 'register' | 'teams' | 'rules' | 'contacts' | 'schedule';

export default function Index() {
  const [activeSection, setActiveSection] = useState<Section>('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    team_name: '',
    captain_name: '',
    captain_telegram: '',
    members_count: '',
    members_info: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
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
          members_count: '',
          members_info: ''
        });
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось отправить заявку",
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

  const handleTeamsClick = () => {
    setActiveSection('teams');
    loadTeams();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        activeSection={activeSection}
        isAdmin={isAdmin}
        onNavigate={setActiveSection}
        onAdminToggle={() => setIsAdmin(!isAdmin)}
        onTeamsClick={handleTeamsClick}
      />

      <main className="container mx-auto px-4 py-12">
        {activeSection === 'home' && (
          <HomeSection onNavigate={setActiveSection} />
        )}

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
          />
        )}

        {activeSection === 'rules' && (
          <RulesSection onNavigateToContacts={() => setActiveSection('contacts')} />
        )}

        {activeSection === 'contacts' && (
          <ContactsSection />
        )}

        {activeSection === 'schedule' && (
          <ScheduleSection />
        )}
      </main>

      <Footer />
    </div>
  );
}