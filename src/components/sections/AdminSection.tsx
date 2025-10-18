import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import funcUrls from '../../../backend/func2url.json';

const SETTINGS_URL = funcUrls['registration-settings'];

interface AdminSectionProps {
  teams: { status: string }[];
  onNavigate?: (section: 'teams') => void;
}

export default function AdminSection({ teams, onNavigate }: AdminSectionProps) {
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-heading font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Администрация
        </h2>
        <p className="text-muted-foreground text-lg">
          Управление системой регистрации команд
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Управление регистрацией</CardTitle>
          <CardDescription>
            Контроль периода приёма заявок и редактирования команд
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-6 bg-muted/50 rounded-lg">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">
                {isRegistrationOpen ? 'Регистрация открыта' : 'Регистрация закрыта'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isRegistrationOpen 
                  ? 'Капитаны могут редактировать и удалять свои команды' 
                  : 'Капитаны не могут редактировать команды'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={isRegistrationOpen ? 'default' : 'secondary'} className="text-sm px-3 py-1">
                {isRegistrationOpen ? 'Активна' : 'Завершена'}
              </Badge>
              <Button 
                onClick={handleToggleRegistration}
                disabled={isLoadingSettings}
                variant={isRegistrationOpen ? 'destructive' : 'default'}
                size="lg"
              >
                <Icon 
                  name={isRegistrationOpen ? 'XCircle' : 'CheckCircle'} 
                  size={18} 
                  className="mr-2" 
                />
                {isRegistrationOpen ? 'Завершить регистрацию' : 'Открыть регистрацию'}
              </Button>
            </div>
          </div>

          <div className="space-y-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-start gap-2">
              <Icon name="Info" size={18} className="text-blue-500 mt-0.5" />
              <div className="space-y-2 text-sm">
                <p className="font-medium text-blue-500">Информация о статусах:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• <strong>Открыта:</strong> Капитаны могут редактировать состав, название команды и отменять регистрацию</li>
                  <li>• <strong>Закрыта:</strong> Команды заблокированы для изменений, можно только просматривать</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <Icon name="Users" size={32} className="mx-auto text-primary" />
                  <p className="text-3xl font-bold">{teams.length}</p>
                  <p className="text-sm text-muted-foreground">Всего команд</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <Icon name="CheckCircle" size={32} className="mx-auto text-green-500" />
                  <p className="text-3xl font-bold">{teams.filter(t => t.status === 'approved').length}</p>
                  <p className="text-sm text-muted-foreground">Одобрено</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <Icon name="Clock" size={32} className="mx-auto text-orange-500" />
                  <p className="text-3xl font-bold">{teams.filter(t => t.status === 'pending').length}</p>
                  <p className="text-sm text-muted-foreground">На модерации</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Bot" className="h-6 w-6 text-primary" />
              Telegram Бот
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Управление Telegram ботом для регистрации команд
            </p>
            <Button 
              onClick={() => window.location.href = '/setup-bot'}
              className="w-full"
            >
              <Icon name="Settings" className="mr-2 h-4 w-4" />
              Настройки бота
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Users" className="h-6 w-6 text-primary" />
              Команды
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Просмотр и модерация зарегистрированных команд
            </p>
            <Button 
              onClick={() => onNavigate && onNavigate('teams')}
              className="w-full"
              variant="outline"
            >
              <Icon name="List" className="mr-2 h-4 w-4" />
              Перейти к командам
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}