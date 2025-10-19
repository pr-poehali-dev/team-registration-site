import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import funcUrls from '../../../backend/func2url.json';
import AdminManagement from '@/components/AdminManagement';

const SETTINGS_URL = funcUrls['registration-settings'];

interface AdminSectionProps {
  teams: { status: string }[];
  onNavigate?: (section: 'teams' | 'register') => void;
  isSuperAdmin?: boolean;
  adminUsername?: string;
  adminToken?: string;
  isRegistrationOpen?: boolean;
  isLoadingSettings?: boolean;
  onToggleRegistration?: () => void;
}

export default function AdminSection({ teams, onNavigate, isSuperAdmin = false, adminUsername = '', adminToken = '', isRegistrationOpen, isLoadingSettings, onToggleRegistration }: AdminSectionProps) {
  const { toast } = useToast();

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
    </div>
  );
}