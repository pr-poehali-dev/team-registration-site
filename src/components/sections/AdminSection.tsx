import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

export default function AdminSection() {
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
              onClick={() => window.location.href = '/?section=teams'}
              className="w-full"
              variant="outline"
            >
              <Icon name="List" className="mr-2 h-4 w-4" />
              Перейти к командам
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Settings" className="h-6 w-6 text-primary" />
              Настройки
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Общие настройки системы регистрации
            </p>
            <Button 
              className="w-full"
              variant="outline"
              disabled
            >
              <Icon name="Cog" className="mr-2 h-4 w-4" />
              Скоро
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="BarChart" className="h-6 w-6 text-primary" />
              Статистика
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Статистика регистраций и активности
            </p>
            <Button 
              className="w-full"
              variant="outline"
              disabled
            >
              <Icon name="TrendingUp" className="mr-2 h-4 w-4" />
              Скоро
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
