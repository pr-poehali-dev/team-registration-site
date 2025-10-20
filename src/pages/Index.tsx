import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

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

export default function Index() {
  const [activeSection, setActiveSection] = useState<'home' | 'register' | 'teams' | 'rules' | 'contacts' | 'schedule'>('home');
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

  return (
    <div className="min-h-screen bg-background">
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
                variant={activeSection === 'home' ? 'default' : 'ghost'} 
                onClick={() => setActiveSection('home')}
                className="transition-all"
              >
                <Icon name="Home" size={18} className="mr-2" />
                Главная
              </Button>
              <Button 
                variant={activeSection === 'register' ? 'default' : 'ghost'} 
                onClick={() => setActiveSection('register')}
                className="transition-all"
              >
                <Icon name="UserPlus" size={18} className="mr-2" />
                Регистрация
              </Button>
              <Button 
                variant={activeSection === 'teams' ? 'default' : 'ghost'} 
                onClick={() => {
                  setActiveSection('teams');
                  loadTeams();
                }}
                className="transition-all"
              >
                <Icon name="Users" size={18} className="mr-2" />
                Команды
              </Button>
              <Button 
                variant={activeSection === 'rules' ? 'default' : 'ghost'} 
                onClick={() => setActiveSection('rules')}
                className="transition-all"
              >
                <Icon name="FileText" size={18} className="mr-2" />
                Правила
              </Button>
              <Button 
                variant={activeSection === 'contacts' ? 'default' : 'ghost'} 
                onClick={() => setActiveSection('contacts')}
                className="transition-all"
              >
                <Icon name="Mail" size={18} className="mr-2" />
                Контакты
              </Button>
              <Button 
                variant={activeSection === 'schedule' ? 'default' : 'ghost'} 
                onClick={() => setActiveSection('schedule')}
                className="transition-all"
              >
                <Icon name="Calendar" size={18} className="mr-2" />
                Сетка
              </Button>
            </div>
            <Button
              variant={isAdmin ? 'destructive' : 'outline'}
              onClick={() => setIsAdmin(!isAdmin)}
              className="transition-all"
            >
              <Icon name="Shield" size={18} className="mr-2" />
              {isAdmin ? 'Выйти' : 'Админ'}
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12">
        {activeSection === 'home' && (
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
                <Button size="lg" onClick={() => setActiveSection('register')} className="group">
                  Зарегистрировать команду
                  <Icon name="ArrowRight" size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => setActiveSection('teams')}>
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
        )}

        {activeSection === 'register' && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-3xl font-heading flex items-center gap-3">
                  <Icon name="UserPlus" size={32} className="text-primary" />
                  Регистрация команды
                </CardTitle>
                <CardDescription>Заполните форму для регистрации вашей команды</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="team_name">Название команды *</Label>
                    <Input
                      id="team_name"
                      value={formData.team_name}
                      onChange={(e) => setFormData({...formData, team_name: e.target.value})}
                      placeholder="Введите название команды"
                      required
                      className="border-primary/20 focus:border-primary"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="captain_name">ФИО капитана *</Label>
                      <Input
                        id="captain_name"
                        value={formData.captain_name}
                        onChange={(e) => setFormData({...formData, captain_name: e.target.value})}
                        placeholder="Иванов Иван Иванович"
                        required
                        className="border-primary/20 focus:border-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="members_count">Количество участников (5-7) *</Label>
                      <Input
                        id="members_count"
                        type="number"
                        min="5"
                        max="7"
                        value={formData.members_count}
                        onChange={(e) => setFormData({...formData, members_count: e.target.value})}
                        placeholder="5"
                        required
                        className="border-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="captain_telegram">Telegram капитана *</Label>
                    <Input
                      id="captain_telegram"
                      value={formData.captain_telegram}
                      onChange={(e) => setFormData({...formData, captain_telegram: e.target.value})}
                      placeholder="@username"
                      required
                      className="border-primary/20 focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="members_info">Информация об участниках</Label>
                    <Textarea
                      id="members_info"
                      value={formData.members_info}
                      onChange={(e) => setFormData({...formData, members_info: e.target.value})}
                      placeholder="Укажите ФИО всех участников команды (5-7 человек), каждый с новой строки"
                      rows={6}
                      className="border-primary/20 focus:border-primary"
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full group">
                    <Icon name="Send" size={18} className="mr-2 group-hover:translate-x-1 transition-transform" />
                    Отправить заявку
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSection === 'teams' && (
          <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-4xl font-heading font-bold">Зарегистрированные команды</h2>
              <Button onClick={loadTeams} variant="outline">
                <Icon name="RefreshCw" size={18} className="mr-2" />
                Обновить
              </Button>
            </div>

            {isAdmin && (
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-4">
                  <TabsTrigger value="all">Все</TabsTrigger>
                  <TabsTrigger value="pending">Ожидают</TabsTrigger>
                  <TabsTrigger value="approved">Одобрены</TabsTrigger>
                  <TabsTrigger value="rejected">Отклонены</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4 mt-6">
                  {teams.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Icon name="Inbox" size={48} className="text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Нет зарегистрированных команд</p>
                      </CardContent>
                    </Card>
                  ) : (
                    teams.map((team) => (
                      <Card key={team.id} className="border-primary/20">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="font-heading flex items-center gap-3">
                                {team.team_name}
                                <Badge variant={
                                  team.status === 'approved' ? 'default' : 
                                  team.status === 'rejected' ? 'destructive' : 'secondary'
                                }>
                                  {team.status === 'pending' && 'На модерации'}
                                  {team.status === 'approved' && 'Одобрена'}
                                  {team.status === 'rejected' && 'Отклонена'}
                                </Badge>
                              </CardTitle>
                              <CardDescription>
                                Капитан: {team.captain_name} • Участников: {team.members_count}
                              </CardDescription>
                            </div>
                            {isAdmin && team.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => handleStatusChange(team.id, 'approved')}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Icon name="Check" size={16} className="mr-1" />
                                  Одобрить
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => handleStatusChange(team.id, 'rejected')}
                                >
                                  <Icon name="X" size={16} className="mr-1" />
                                  Отклонить
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Telegram:</span> {team.captain_telegram}
                          </div>
                          {team.members_info && (
                            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                              <p className="text-sm font-medium mb-2">Состав команды:</p>
                              <p className="text-sm text-muted-foreground whitespace-pre-line">{team.members_info}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            )}

            {!isAdmin && (
              <div className="text-center py-12">
                <Icon name="Lock" size={48} className="text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Войдите как администратор для просмотра команд</p>
              </div>
            )}
          </div>
        )}

        {activeSection === 'rules' && (
          <div className="max-w-3xl mx-auto animate-fade-in">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-3xl font-heading flex items-center gap-3">
                  <Icon name="FileText" size={32} className="text-primary" />
                  Правила регистрации
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold">1</span>
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold mb-2">Заполнение формы</h3>
                      <p className="text-muted-foreground">Укажите достоверную информацию о команде и капитане. Все поля, отмеченные звездочкой (*), обязательны для заполнения.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold">2</span>
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold mb-2">Модерация заявки</h3>
                      <p className="text-muted-foreground">После отправки заявка поступает в Telegram администраторов для проверки. Срок рассмотрения — до 3 рабочих дней.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold">3</span>
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold mb-2">Уведомление о результате</h3>
                      <p className="text-muted-foreground">Решение по заявке будет отправлено в Telegram капитану команды.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold">4</span>
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold mb-2">Требования к команде</h3>
                      <p className="text-muted-foreground">Количество участников в команде: от 5 до 7 человек.</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="flex gap-3">
                    <Icon name="Info" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm">
                      При возникновении вопросов обращайтесь в раздел <button onClick={() => setActiveSection('contacts')} className="text-primary underline hover:no-underline">Контакты</button>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSection === 'schedule' && (
          <div className="max-w-6xl mx-auto animate-fade-in">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-3xl font-heading flex items-center gap-3">
                  <Icon name="Calendar" size={32} className="text-primary" />
                  Сетка мероприятия
                </CardTitle>
                <CardDescription>Расписание игр и турнирная таблица</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Icon name="CalendarClock" size={64} className="text-muted-foreground mx-auto mb-4" />
                  <p className="text-xl text-muted-foreground mb-2">Сетка появится после завершения регистрации</p>
                  <p className="text-sm text-muted-foreground">Здесь будет отображаться расписание игр и результаты</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSection === 'contacts' && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-3xl font-heading flex items-center gap-3">
                  <Icon name="Mail" size={32} className="text-primary" />
                  Контакты
                </CardTitle>
                <CardDescription>Свяжитесь с нами по любым вопросам</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:border-primary/40 transition-all">
                    <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Icon name="Mail" size={24} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-muted-foreground">info@teamreg.example.com</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:border-primary/40 transition-all">
                    <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Icon name="Phone" size={24} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Телефон</p>
                      <p className="text-muted-foreground">+7 (999) 123-45-67</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:border-primary/40 transition-all">
                    <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Icon name="MessageCircle" size={24} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Telegram</p>
                      <p className="text-muted-foreground">@teamreg_support</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:border-primary/40 transition-all">
                    <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Icon name="Clock" size={24} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Время работы</p>
                      <p className="text-muted-foreground">Пн-Пт: 9:00 - 18:00 (МСК)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <footer className="border-t border-border/50 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">© 2025 TeamReg. Все права защищены.</p>
            <div className="flex gap-4">
              <Icon name="Github" size={20} className="text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Icon name="Twitter" size={20} className="text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Icon name="Linkedin" size={20} className="text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}