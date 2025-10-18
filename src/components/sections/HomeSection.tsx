import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface HomeSectionProps {
  onNavigate: (section: 'register' | 'teams') => void;
}

export default function HomeSection({ onNavigate }: HomeSectionProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-fade-in">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-4">
          <Icon name="Sparkles" size={16} className="text-primary" />
          <span className="text-sm font-medium text-primary">Футуристичная платформа регистрации</span>
        </div>
        <h2 className="text-6xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent leading-tight">
          Регистрация команд нового поколения
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Современная система управления командами с продвинутой модерацией и аналитикой в реальном времени
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Button size="lg" onClick={() => onNavigate('register')} className="group">
            Зарегистрировать команду
            <Icon name="ArrowRight" size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => onNavigate('teams')}>
            <Icon name="Users" size={18} className="mr-2" />
            Просмотреть команды
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 pt-8">
        <Card className="border-primary/20 bg-card/50 backdrop-blur hover:border-primary/40 transition-all hover:scale-105">
          <CardHeader>
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
              <Icon name="Rocket" size={24} className="text-primary" />
            </div>
            <CardTitle className="font-heading">Мгновенная регистрация</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Зарегистрируйте команду за 2 минуты через интуитивную форму</p>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 bg-card/50 backdrop-blur hover:border-secondary/40 transition-all hover:scale-105">
          <CardHeader>
            <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center mb-4">
              <Icon name="Shield" size={24} className="text-secondary" />
            </div>
            <CardTitle className="font-heading">Умная модерация</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Система проверки заявок с возможностью комментирования</p>
          </CardContent>
        </Card>

        <Card className="border-accent/20 bg-card/50 backdrop-blur hover:border-accent/40 transition-all hover:scale-105">
          <CardHeader>
            <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4">
              <Icon name="Activity" size={24} className="text-accent" />
            </div>
            <CardTitle className="font-heading">Статистика в реальном времени</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Отслеживайте статус заявок и количество зарегистрированных команд</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
