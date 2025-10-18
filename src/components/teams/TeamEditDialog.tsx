import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

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

interface TeamEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editFormData: EditFormData;
  onFormChange: (data: EditFormData) => void;
  onSave: () => void;
}

export default function TeamEditDialog({ isOpen, onClose, editFormData, onFormChange, onSave }: TeamEditDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактировать команду</DialogTitle>
          <DialogDescription>
            Внесите изменения в информацию о команде
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-team-name">Название команды</Label>
              <Input
                id="edit-team-name"
                value={editFormData.team_name}
                onChange={(e) => onFormChange({ ...editFormData, team_name: e.target.value })}
                placeholder="Название команды"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-captain-name">Капитан</Label>
                <Input
                  id="edit-captain-name"
                  value={editFormData.captain_name}
                  onChange={(e) => onFormChange({ ...editFormData, captain_name: e.target.value })}
                  placeholder="Имя капитана"
                />
              </div>
              <div>
                <Label htmlFor="edit-captain-telegram">Telegram капитана</Label>
                <Input
                  id="edit-captain-telegram"
                  value={editFormData.captain_telegram}
                  onChange={(e) => onFormChange({ ...editFormData, captain_telegram: e.target.value })}
                  placeholder="@username"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Состав команды</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-top-player">Топ игрок</Label>
                <Input
                  id="edit-top-player"
                  value={editFormData.top_player}
                  onChange={(e) => onFormChange({ ...editFormData, top_player: e.target.value })}
                  placeholder="Имя игрока"
                />
              </div>
              <div>
                <Label htmlFor="edit-top-telegram">Telegram топа</Label>
                <Input
                  id="edit-top-telegram"
                  value={editFormData.top_telegram}
                  onChange={(e) => onFormChange({ ...editFormData, top_telegram: e.target.value })}
                  placeholder="@username"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-jungle-player">Лесник</Label>
                <Input
                  id="edit-jungle-player"
                  value={editFormData.jungle_player}
                  onChange={(e) => onFormChange({ ...editFormData, jungle_player: e.target.value })}
                  placeholder="Имя игрока"
                />
              </div>
              <div>
                <Label htmlFor="edit-jungle-telegram">Telegram лесника</Label>
                <Input
                  id="edit-jungle-telegram"
                  value={editFormData.jungle_telegram}
                  onChange={(e) => onFormChange({ ...editFormData, jungle_telegram: e.target.value })}
                  placeholder="@username"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-mid-player">Мидер</Label>
                <Input
                  id="edit-mid-player"
                  value={editFormData.mid_player}
                  onChange={(e) => onFormChange({ ...editFormData, mid_player: e.target.value })}
                  placeholder="Имя игрока"
                />
              </div>
              <div>
                <Label htmlFor="edit-mid-telegram">Telegram мидера</Label>
                <Input
                  id="edit-mid-telegram"
                  value={editFormData.mid_telegram}
                  onChange={(e) => onFormChange({ ...editFormData, mid_telegram: e.target.value })}
                  placeholder="@username"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-adc-player">АДК</Label>
                <Input
                  id="edit-adc-player"
                  value={editFormData.adc_player}
                  onChange={(e) => onFormChange({ ...editFormData, adc_player: e.target.value })}
                  placeholder="Имя игрока"
                />
              </div>
              <div>
                <Label htmlFor="edit-adc-telegram">Telegram АДК</Label>
                <Input
                  id="edit-adc-telegram"
                  value={editFormData.adc_telegram}
                  onChange={(e) => onFormChange({ ...editFormData, adc_telegram: e.target.value })}
                  placeholder="@username"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-support-player">Саппорт</Label>
                <Input
                  id="edit-support-player"
                  value={editFormData.support_player}
                  onChange={(e) => onFormChange({ ...editFormData, support_player: e.target.value })}
                  placeholder="Имя игрока"
                />
              </div>
              <div>
                <Label htmlFor="edit-support-telegram">Telegram саппорта</Label>
                <Input
                  id="edit-support-telegram"
                  value={editFormData.support_telegram}
                  onChange={(e) => onFormChange({ ...editFormData, support_telegram: e.target.value })}
                  placeholder="@username"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button onClick={onSave}>
              <Icon name="Save" size={16} className="mr-2" />
              Сохранить
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
