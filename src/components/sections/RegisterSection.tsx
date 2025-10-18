import { Button } from '@/components/ui/button';
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
}

export default function RegisterSection({ formData, onFormChange, onSubmit }: RegisterSectionProps) {
  return (
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
          <form onSubmit={onSubmit} className="space-y-6">
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

              <h4 className="text-md font-semibold mt-6">Запасные игроки</h4>

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
