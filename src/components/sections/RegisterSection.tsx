import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface RegisterSectionProps {
  formData: {
    team_name: string;
    captain_name: string;
    captain_telegram: string;
    members_count: string;
    members_info: string;
    top_player: string;
    top_telegram: string;
    jungle_player: string;
    jungle_telegram: string;
    mid_player: string;
    mid_telegram: string;
    adc_player: string;
    adc_telegram: string;
    support_player: string;
    support_telegram: string;
    sub1_player: string;
    sub1_telegram: string;
    sub2_player: string;
    sub2_telegram: string;
  };
  onFormChange: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  isRegistrationOpen?: boolean;
  isLoadingSettings?: boolean;
  onToggleRegistration?: () => void;
}

export default function RegisterSection({ formData, onFormChange, onSubmit, isRegistrationOpen = true, isLoadingSettings = false, onToggleRegistration }: RegisterSectionProps) {
  return (
    <div className="max-w-2xl mx-auto animate-fade-in px-4 space-y-6">
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="p-3 bg-blue-500/20 rounded-lg hidden sm:block">
            <Icon name="Info" size={24} className="text-blue-500" />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="text-lg font-semibold text-blue-500">Регистрация в турнирном боте</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Для участия в турнире необходимо зарегистрироваться через Telegram бот. 
              После регистрации вы получите уникальный код, который понадобится для управления командой.
            </p>
            <a 
              href="https://t.me/TournamentWR_bot" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors mt-3"
            >
              <Icon name="Send" size={18} />
              Открыть бота
            </a>
          </div>
        </div>
      </div>

      {onToggleRegistration && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 bg-muted/50 rounded-lg">
              <div className="space-y-1 flex-1">
                <h3 className="text-base sm:text-lg font-semibold">
                  {isRegistrationOpen ? 'Регистрация открыта' : 'Регистрация закрыта'}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {isRegistrationOpen 
                    ? 'Капитаны могут редактировать и удалять свои команды' 
                    : 'Капитаны не могут редактировать команды'}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <Badge variant={isRegistrationOpen ? 'default' : 'secondary'} className="text-xs sm:text-sm px-3 py-1 text-center">
                  {isRegistrationOpen ? 'Активна' : 'Завершена'}
                </Badge>
                <Button 
                  onClick={onToggleRegistration}
                  disabled={isLoadingSettings}
                  variant={isRegistrationOpen ? 'destructive' : 'default'}
                  size="default"
                  className="w-full sm:w-auto text-sm"
                >
                  <Icon 
                    name={isRegistrationOpen ? 'XCircle' : 'CheckCircle'} 
                    size={16} 
                    className="mr-2" 
                  />
                  <span className="whitespace-nowrap">{isRegistrationOpen ? 'Завершить' : 'Открыть'} регистрацию</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-primary/20">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-2xl sm:text-3xl font-heading flex items-center gap-2 sm:gap-3">
            <Icon name="UserPlus" size={24} className="text-primary sm:w-8 sm:h-8" />
            Регистрация команды
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">Заполните форму для регистрации вашей команды</CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="team_name">Название команды *</Label>
              <Input
                id="team_name"
                value={formData.team_name}
                onChange={(e) => onFormChange({...formData, team_name: e.target.value})}
                placeholder="Введите название команды"
                required
                className="border-primary/20 focus:border-primary"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="captain_name">Ник капитана *</Label>
                <Input
                  id="captain_name"
                  value={formData.captain_name}
                  onChange={(e) => onFormChange({...formData, captain_name: e.target.value})}
                  placeholder="IvanGamer"
                  required
                  className="border-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="captain_telegram">Telegram капитана *</Label>
                <Input
                  id="captain_telegram"
                  value={formData.captain_telegram}
                  onChange={(e) => onFormChange({...formData, captain_telegram: e.target.value})}
                  placeholder="@username"
                  required
                  className="border-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Состав команды</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="top_player">Топ *</Label>
                  <Input
                    id="top_player"
                    value={formData.top_player}
                    onChange={(e) => onFormChange({...formData, top_player: e.target.value})}
                    placeholder="Ник игрока"
                    required
                    className="border-primary/20 focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="top_telegram">Telegram топа *</Label>
                  <Input
                    id="top_telegram"
                    value={formData.top_telegram}
                    onChange={(e) => onFormChange({...formData, top_telegram: e.target.value})}
                    placeholder="@username"
                    required
                    className="border-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jungle_player">Лес *</Label>
                  <Input
                    id="jungle_player"
                    value={formData.jungle_player}
                    onChange={(e) => onFormChange({...formData, jungle_player: e.target.value})}
                    placeholder="Ник игрока"
                    required
                    className="border-primary/20 focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jungle_telegram">Telegram леса *</Label>
                  <Input
                    id="jungle_telegram"
                    value={formData.jungle_telegram}
                    onChange={(e) => onFormChange({...formData, jungle_telegram: e.target.value})}
                    placeholder="@username"
                    required
                    className="border-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mid_player">Мид *</Label>
                  <Input
                    id="mid_player"
                    value={formData.mid_player}
                    onChange={(e) => onFormChange({...formData, mid_player: e.target.value})}
                    placeholder="Ник игрока"
                    required
                    className="border-primary/20 focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mid_telegram">Telegram мида *</Label>
                  <Input
                    id="mid_telegram"
                    value={formData.mid_telegram}
                    onChange={(e) => onFormChange({...formData, mid_telegram: e.target.value})}
                    placeholder="@username"
                    required
                    className="border-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adc_player">АДК *</Label>
                  <Input
                    id="adc_player"
                    value={formData.adc_player}
                    onChange={(e) => onFormChange({...formData, adc_player: e.target.value})}
                    placeholder="Ник игрока"
                    required
                    className="border-primary/20 focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adc_telegram">Telegram АДК *</Label>
                  <Input
                    id="adc_telegram"
                    value={formData.adc_telegram}
                    onChange={(e) => onFormChange({...formData, adc_telegram: e.target.value})}
                    placeholder="@username"
                    required
                    className="border-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="support_player">Саппорт *</Label>
                  <Input
                    id="support_player"
                    value={formData.support_player}
                    onChange={(e) => onFormChange({...formData, support_player: e.target.value})}
                    placeholder="Ник игрока"
                    required
                    className="border-primary/20 focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support_telegram">Telegram саппорта *</Label>
                  <Input
                    id="support_telegram"
                    value={formData.support_telegram}
                    onChange={(e) => onFormChange({...formData, support_telegram: e.target.value})}
                    placeholder="@username"
                    required
                    className="border-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sub1_player">Запасной 1</Label>
                  <Input
                    id="sub1_player"
                    value={formData.sub1_player}
                    onChange={(e) => onFormChange({...formData, sub1_player: e.target.value})}
                    placeholder="Ник игрока"
                    className="border-primary/20 focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sub1_telegram">Telegram запасного 1</Label>
                  <Input
                    id="sub1_telegram"
                    value={formData.sub1_telegram}
                    onChange={(e) => onFormChange({...formData, sub1_telegram: e.target.value})}
                    placeholder="@username"
                    className="border-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sub2_player">Запасной 2</Label>
                  <Input
                    id="sub2_player"
                    value={formData.sub2_player}
                    onChange={(e) => onFormChange({...formData, sub2_player: e.target.value})}
                    placeholder="Ник игрока"
                    className="border-primary/20 focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sub2_telegram">Telegram запасного 2</Label>
                  <Input
                    id="sub2_telegram"
                    value={formData.sub2_telegram}
                    onChange={(e) => onFormChange({...formData, sub2_telegram: e.target.value})}
                    placeholder="@username"
                    className="border-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full group">
              <Icon name="Send" size={18} className="mr-2 group-hover:translate-x-1 transition-transform" />
              Отправить заявку
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}