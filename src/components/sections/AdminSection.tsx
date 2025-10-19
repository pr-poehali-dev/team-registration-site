import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import funcUrls from '../../../backend/func2url.json';
import AdminManagement from '@/components/AdminManagement';
import TeamStatusManagement from '@/components/TeamStatusManagement';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const SETTINGS_URL = funcUrls['registration-settings'];
const TEAMS_URL = funcUrls.teams;

interface AdminSectionProps {
  teams: { status: string }[];
  onNavigate?: (section: 'teams' | 'register') => void;
  isSuperAdmin?: boolean;
  adminUsername?: string;
  adminToken?: string;
  isRegistrationOpen?: boolean;
  isLoadingSettings?: boolean;
  onToggleRegistration?: () => void;
  onTeamsUpdated?: () => void;
}

export default function AdminSection({ teams, onNavigate, isSuperAdmin = false, adminUsername = '', adminToken = '', isRegistrationOpen, isLoadingSettings, onToggleRegistration, onTeamsUpdated }: AdminSectionProps) {
  const { toast } = useToast();
  const [isResetAllDialogOpen, setIsResetAllDialogOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleResetAllTeams = async () => {
    setIsResetting(true);
    try {
      const response = await fetch(`${TEAMS_URL}?reset_all=true`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Token': adminToken
        }
      });

      if (response.ok) {
        toast({
          title: "Все команды удалены",
          description: "Все данные команд полностью удалены из системы."
        });
        setIsResetAllDialogOpen(false);
        if (onTeamsUpdated) {
          onTeamsUpdated();
        }
      } else {
        throw new Error('Reset failed');
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить команды",
        variant: "destructive"
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="text-center mb-6 sm:mb-8 px-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold mb-2 sm:mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Администрация
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
          Управление системой регистрации команд
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Статистика</CardTitle>
          <CardDescription>
            Общая информация о зарегистрированных командах
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      {isSuperAdmin && (
        <AdminManagement currentUsername={adminUsername} />
      )}

      <TeamStatusManagement adminToken={adminToken} />

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="UserPlus" className="h-6 w-6 text-primary" />
              Регистрация
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Управление периодом регистрации команд
            </p>
            <Button 
              onClick={() => onNavigate && onNavigate('register')}
              className="w-full"
            >
              <Icon name="Settings" className="mr-2 h-4 w-4" />
              Настройки регистрации
            </Button>
          </CardContent>
        </Card>

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
              variant="outline"
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

      <Card className="border-destructive/50 mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Icon name="AlertTriangle" className="h-6 w-6" />
            Опасная зона
          </CardTitle>
          <CardDescription>
            Необратимые действия, которые могут повлиять на все данные
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-destructive/30 rounded-lg bg-destructive/5">
              <div>
                <p className="font-medium text-sm">Сброс всех команд</p>
                <p className="text-xs text-muted-foreground">
                  Полностью удалить все команды из системы ({teams.length} {teams.length === 1 ? 'команда' : 'команд'})
                </p>
              </div>
              <Button 
                variant="destructive"
                size="sm"
                onClick={() => setIsResetAllDialogOpen(true)}
                disabled={teams.length === 0}
              >
                <Icon name="Trash2" className="mr-2 h-4 w-4" />
                Сбросить все
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isResetAllDialogOpen} onOpenChange={setIsResetAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить все команды?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие полностью удалит {teams.length} {teams.length === 1 ? 'команду' : 'команд'} из системы, 
              включая все коды регистрации и данные участников. Это действие необратимо.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResetting}>Отмена</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleResetAllTeams} 
              disabled={isResetting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isResetting ? (
                <>
                  <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                  Удаление...
                </>
              ) : (
                'Да, удалить все команды'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}