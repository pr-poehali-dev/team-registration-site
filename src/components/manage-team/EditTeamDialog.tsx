import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EditFormData {
  team_name: string;
  captain_name: string;
  captain_telegram: string;
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
}

interface EditTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: EditFormData;
  onFormDataChange: (data: EditFormData) => void;
  onSave: () => void;
}

export default function EditTeamDialog({
  open,
  onOpenChange,
  formData,
  onFormDataChange,
  onSave
}: EditTeamDialogProps) {
  const updateField = (field: keyof EditFormData, value: string) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактировать команду</DialogTitle>
          <DialogDescription>
            Изменение информации о команде и составе
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Название команды</Label>
            <Input
              value={formData.team_name}
              onChange={(e) => updateField('team_name', e.target.value)}
              placeholder="Название команды"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ник капитана</Label>
              <Input
                value={formData.captain_name}
                onChange={(e) => updateField('captain_name', e.target.value)}
                placeholder="Ник капитана"
              />
            </div>
            <div className="space-y-2">
              <Label>Telegram капитана</Label>
              <Input
                value={formData.captain_telegram}
                onChange={(e) => updateField('captain_telegram', e.target.value)}
                placeholder="@username"
              />
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <p className="text-sm font-medium mb-4">Состав команды</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Топ</Label>
              <Input
                value={formData.top_player}
                onChange={(e) => updateField('top_player', e.target.value)}
                placeholder="Ник игрока"
              />
            </div>
            <div className="space-y-2">
              <Label>Telegram топа</Label>
              <Input
                value={formData.top_telegram}
                onChange={(e) => updateField('top_telegram', e.target.value)}
                placeholder="@username"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Лес</Label>
              <Input
                value={formData.jungle_player}
                onChange={(e) => updateField('jungle_player', e.target.value)}
                placeholder="Ник игрока"
              />
            </div>
            <div className="space-y-2">
              <Label>Telegram леса</Label>
              <Input
                value={formData.jungle_telegram}
                onChange={(e) => updateField('jungle_telegram', e.target.value)}
                placeholder="@username"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Мид</Label>
              <Input
                value={formData.mid_player}
                onChange={(e) => updateField('mid_player', e.target.value)}
                placeholder="Ник игрока"
              />
            </div>
            <div className="space-y-2">
              <Label>Telegram мида</Label>
              <Input
                value={formData.mid_telegram}
                onChange={(e) => updateField('mid_telegram', e.target.value)}
                placeholder="@username"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>АДК</Label>
              <Input
                value={formData.adc_player}
                onChange={(e) => updateField('adc_player', e.target.value)}
                placeholder="Ник игрока"
              />
            </div>
            <div className="space-y-2">
              <Label>Telegram АДК</Label>
              <Input
                value={formData.adc_telegram}
                onChange={(e) => updateField('adc_telegram', e.target.value)}
                placeholder="@username"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Саппорт</Label>
              <Input
                value={formData.support_player}
                onChange={(e) => updateField('support_player', e.target.value)}
                placeholder="Ник игрока"
              />
            </div>
            <div className="space-y-2">
              <Label>Telegram саппорта</Label>
              <Input
                value={formData.support_telegram}
                onChange={(e) => updateField('support_telegram', e.target.value)}
                placeholder="@username"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={onSave}>
            Сохранить изменения
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
