import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface AdminLoginProps {
  onLogin: (username: string, password: string) => void;
  onCancel?: () => void;
}

export default function AdminLogin({ onLogin, onCancel }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="Shield" size={24} className="text-primary" />
            <CardTitle className="text-2xl">Вход администратора</CardTitle>
          </div>
          <CardDescription>
            Введите логин и пароль для доступа к панели управления
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Логин</Label>
              <Input
                id="username"
                type="text"
                placeholder="Логин"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="text-base"
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-base"
                autoComplete="current-password"
              />
            </div>
            <div className="flex gap-2">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                  <Icon name="X" size={18} className="mr-2" />
                  Отмена
                </Button>
              )}
              <Button type="submit" className="flex-1">
                <Icon name="LogIn" size={18} className="mr-2" />
                Войти
              </Button>
            </div>
          </form>
          
          <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-sm font-medium mb-2 flex items-center gap-2">
              <Icon name="Info" size={16} />
              Как зарегистрироваться?
            </p>
            <p className="text-xs text-muted-foreground">
              Для регистрации администратора используйте Telegram бота и команду:
            </p>
            <code className="block mt-2 p-2 bg-background rounded text-xs">
              /adminlogin логин пароль
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
