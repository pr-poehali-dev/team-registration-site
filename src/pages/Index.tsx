import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import HomeSection from '@/components/sections/HomeSection';
import RegisterSection from '@/components/sections/RegisterSection';
import TeamsSection from '@/components/sections/TeamsSection';
import RulesSection from '@/components/sections/RulesSection';
import ContactsSection from '@/components/sections/ContactsSection';
import ScheduleSection from '@/components/sections/ScheduleSection';

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
  };

  const loadTeams = async () => {
    toast({
      title: "Загрузка команд",
      description: "Данные обновлены",
    });
  };

  const handleStatusChange = async (teamId: number, newStatus: 'approved' | 'rejected') => {
    toast({
      title: "Статус обновлен",
      description: `Команда ${newStatus === 'approved' ? 'одобрена' : 'отклонена'}`,
    });
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
