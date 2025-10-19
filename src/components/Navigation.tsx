import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

type Section = 'register' | 'teams' | 'schedule' | 'manage' | 'admin';

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
      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-3 animate-slide-in">
            <img 
              src="https://cdn.poehali.dev/files/72fd4a3d-b883-48c1-88db-9039e312d860.png" 
              alt="Go Tournament Logo" 
              className="w-7 h-7 sm:w-10 sm:h-10 object-contain flex-shrink-0"
            />
            <h1 className="text-sm sm:text-2xl font-heading font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent whitespace-nowrap">
              <span className="sm:hidden">Go T.</span>
              <span className="hidden sm:inline">Go Tournament</span>
            </h1>
          </div>
          <div className="flex gap-1 sm:gap-2 flex-wrap">
            <Button 
              variant={activeSection === 'register' ? 'default' : 'ghost'} 
              onClick={() => onNavigate('register')}
              className="transition-all text-xs sm:text-sm px-2 sm:px-4"
              size="sm"
            >
              <Icon name="UserPlus" size={16} className="sm:mr-2" />
              <span className="hidden sm:inline">Регистрация</span>
            </Button>
            <Button 
              variant={activeSection === 'teams' ? 'default' : 'ghost'} 
              onClick={onTeamsClick}
              className="transition-all text-xs sm:text-sm px-2 sm:px-4"
              size="sm"
            >
              <Icon name="Users" size={16} className="sm:mr-2" />
              <span className="hidden sm:inline">Команды</span>
            </Button>
            <Button 
              variant={activeSection === 'schedule' ? 'default' : 'ghost'} 
              onClick={() => onNavigate('schedule')}
              className="transition-all text-xs sm:text-sm px-2 sm:px-4"
              size="sm"
            >
              <Icon name="Calendar" size={16} className="sm:mr-2" />
              <span className="hidden sm:inline">Сетка</span>
            </Button>
            <Button 
              variant={activeSection === 'manage' ? 'default' : 'ghost'} 
              onClick={() => onNavigate('manage')}
              className="transition-all text-xs sm:text-sm px-2 sm:px-4"
              size="sm"
            >
              <Icon name="Settings" size={16} className="sm:mr-2" />
              <span className="hidden sm:inline">Моя команда</span>
            </Button>
            {isAdmin && (
              <Button 
                variant={activeSection === 'admin' ? 'default' : 'ghost'}
                onClick={() => onNavigate('admin')}
                className="transition-all text-xs sm:text-sm px-2 sm:px-4"
                size="sm"
              >
                <Icon name="ShieldCheck" size={16} className="sm:mr-2" />
                <span className="hidden sm:inline">Администрация</span>
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