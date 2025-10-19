import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface BracketGenerationDialogProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (settings: BracketSettings) => void;
  teamCount: number;
}

export interface BracketSettings {
  upperRounds: number;
  lowerRounds: number;
  hasGrandFinal: boolean;
  bracketType: 'double' | 'single';
  autoCalculate: boolean;
}

export default function BracketGenerationDialog({
  open,
  onClose,
  onGenerate,
  teamCount,
}: BracketGenerationDialogProps) {
  const maxRounds = Math.ceil(Math.log2(Math.max(teamCount, 2)));
  
  const [settings, setSettings] = useState<BracketSettings>({
    upperRounds: maxRounds,
    lowerRounds: Math.max(1, (maxRounds - 1) * 2),
    hasGrandFinal: true,
    bracketType: 'double',
    autoCalculate: true,
  });

  useEffect(() => {
    if (settings.autoCalculate) {
      const calculatedUpper = Math.ceil(Math.log2(Math.max(teamCount, 2)));
      const calculatedLower = Math.max(1, (calculatedUpper - 1) * 2);
      setSettings(prev => ({
        ...prev,
        upperRounds: calculatedUpper,
        lowerRounds: calculatedLower,
      }));
    }
  }, [teamCount, settings.autoCalculate]);

  const handleGenerate = () => {
    onGenerate(settings);
    onClose();
  };

  const estimateMatches = () => {
    if (settings.bracketType === 'single') {
      return Math.pow(2, settings.upperRounds) - 1;
    }
    
    const upperMatches = Math.pow(2, settings.upperRounds) - 1;
    const lowerMatches = settings.lowerRounds > 0 
      ? Math.ceil((Math.pow(2, settings.upperRounds) - 2) * 0.75)
      : 0;
    const grandFinal = settings.hasGrandFinal ? 1 : 0;
    
    return upperMatches + lowerMatches + grandFinal;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Settings" size={20} />
            Настройки турнирной сетки
          </DialogTitle>
          <DialogDescription>
            Настройте параметры генерации турнирной сетки для {teamCount} команд(ы)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Тип турнира */}
          <div className="space-y-3">
            <Label>Тип турнира</Label>
            <RadioGroup
              value={settings.bracketType}
              onValueChange={(value) =>
                setSettings({ ...settings, bracketType: value as 'double' | 'single' })
              }
            >
              <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent cursor-pointer">
                <RadioGroupItem value="double" id="double" />
                <Label htmlFor="double" className="cursor-pointer flex-1">
                  <div className="font-medium">Double Elimination</div>
                  <div className="text-xs text-muted-foreground">
                    Две сетки: верхняя и нижняя (для проигравших)
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent cursor-pointer">
                <RadioGroupItem value="single" id="single" />
                <Label htmlFor="single" className="cursor-pointer flex-1">
                  <div className="font-medium">Single Elimination</div>
                  <div className="text-xs text-muted-foreground">
                    Одна сетка: проиграл = выбыл
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Автоматический расчет */}
          <div className="flex items-center justify-between border rounded-lg p-3">
            <div className="flex-1">
              <Label htmlFor="auto-calc" className="cursor-pointer">
                Автоматический расчёт раундов
              </Label>
              <div className="text-xs text-muted-foreground mt-1">
                Расчёт на основе количества команд
              </div>
            </div>
            <Switch
              id="auto-calc"
              checked={settings.autoCalculate}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, autoCalculate: checked })
              }
            />
          </div>

          {/* Верхняя сетка */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Раунды верхней сетки</Label>
              <span className="text-sm font-medium">{settings.upperRounds}</span>
            </div>
            <Slider
              value={[settings.upperRounds]}
              onValueChange={(v) =>
                setSettings({ ...settings, upperRounds: v[0], autoCalculate: false })
              }
              min={1}
              max={Math.max(maxRounds + 2, 8)}
              step={1}
              disabled={settings.autoCalculate}
              className={settings.autoCalculate ? 'opacity-50' : ''}
            />
            <div className="text-xs text-muted-foreground">
              Рекомендуемо для {teamCount} команд: {maxRounds} раунд(ов)
            </div>
          </div>

          {/* Нижняя сетка (только для double elimination) */}
          {settings.bracketType === 'double' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Раунды нижней сетки</Label>
                <span className="text-sm font-medium">{settings.lowerRounds}</span>
              </div>
              <Slider
                value={[settings.lowerRounds]}
                onValueChange={(v) =>
                  setSettings({ ...settings, lowerRounds: v[0], autoCalculate: false })
                }
                min={0}
                max={Math.max(maxRounds * 2, 10)}
                step={1}
                disabled={settings.autoCalculate}
                className={settings.autoCalculate ? 'opacity-50' : ''}
              />
              <div className="text-xs text-muted-foreground">
                Рекомендуемо: {Math.max(1, (maxRounds - 1) * 2)} раунд(ов)
              </div>
            </div>
          )}

          {/* Гранд-финал */}
          {settings.bracketType === 'double' && (
            <div className="flex items-center justify-between border rounded-lg p-3">
              <div className="flex-1">
                <Label htmlFor="grand-final" className="cursor-pointer">
                  Добавить гранд-финал
                </Label>
                <div className="text-xs text-muted-foreground mt-1">
                  Финальный матч между победителями сеток
                </div>
              </div>
              <Switch
                id="grand-final"
                checked={settings.hasGrandFinal}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, hasGrandFinal: checked })
                }
              />
            </div>
          )}

          {/* Информация */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Icon name="Info" size={16} className="mt-0.5 flex-shrink-0 text-blue-600" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Будет создано матчей: ~{estimateMatches()}</p>
                <p className="text-xs">
                  {settings.bracketType === 'double'
                    ? `Верхняя сетка: ${settings.upperRounds} раундов, Нижняя: ${settings.lowerRounds} раундов${
                        settings.hasGrandFinal ? ' + Гранд-финал' : ''
                      }`
                    : `Single elimination: ${settings.upperRounds} раундов`}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleGenerate}>
            <Icon name="GitBranch" size={16} className="mr-2" />
            Создать сетку
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
