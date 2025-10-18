import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

type Section = 'register' | 'teams' | 'schedule' | 'manage';

interface NavigationProps {
  activeSection: Section;
  isAdmin: boolean;
  onNavigate: (section: Section) => void;
  onAdminToggle: () => void;
  onTeamsClick: () => void;
  onLogout?: () => void;
}

export default function Navigation({ activeSection, isAdmin, onNavigate, onAdminToggle, onTeamsClick, onLogout }: NavigationProps) {
  const handleAdminClick = () => {
    if (isAdmin && onLogout) {
      onLogout();
    } else {
      onAdminToggle();
    }
  };
  return (
    <nav className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 animate-slide-in">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center animate-glow">
              <Icon name="Zap" size={24} className="text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-heading font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              TeamReg
            </h1>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={activeSection === 'register' ? 'default' : 'ghost'} 
              onClick={() => onNavigate('register')}
              className="transition-all"
            >
              <Icon name="UserPlus" size={18} className="mr-2" />
              Регистрация
            </Button>
            <Button 
              variant={activeSection === 'teams' ? 'default' : 'ghost'} 
              onClick={onTeamsClick}
              className="transition-all"
            >
              <Icon name="Users" size={18} className="mr-2" />
              Команды
            </Button>
            <Button 
              variant={activeSection === 'schedule' ? 'default' : 'ghost'} 
              onClick={() => onNavigate('schedule')}
              className="transition-all"
            >
              <Icon name="Calendar" size={18} className="mr-2" />
              Сетка
            </Button>
            <Button 
              variant={activeSection === 'manage' ? 'default' : 'ghost'} 
              onClick={() => onNavigate('manage')}
              className="transition-all"
            >
              <Icon name="Settings" size={18} className="mr-2" />
              Моя команда
            </Button>
            {isAdmin && (
              <Button 
                variant="ghost"
                onClick={() => window.location.href = '/setup-bot'}
                className="transition-all"
              >
                <Icon name="Bot" size={18} className="mr-2" />
                Бот
              </Button>
            )}
          </div>
          <Button
            variant={isAdmin ? 'destructive' : 'outline'}
            onClick={handleAdminClick}
            className="transition-all"
          >
            <Icon name="Shield" size={18} className="mr-2" />
            {isAdmin ? 'Выйти' : 'Админ'}
          </Button>
        </div>
      </div>
    </nav>
  );
}