import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface RegisterSectionProps {
  formData: {
    team_name: string;
    captain_name: string;
    captain_telegram: string;
    members_count: string;
    members_info: string;
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
                <Label htmlFor="captain_name">ФИО капитана *</Label>
                <Input
                  id="captain_name"
                  value={formData.captain_name}
                  onChange={(e) => onFormChange({...formData, captain_name: e.target.value})}
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
                  onChange={(e) => onFormChange({...formData, members_count: e.target.value})}
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
                onChange={(e) => onFormChange({...formData, captain_telegram: e.target.value})}
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
                onChange={(e) => onFormChange({...formData, members_info: e.target.value})}
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
  );
}
