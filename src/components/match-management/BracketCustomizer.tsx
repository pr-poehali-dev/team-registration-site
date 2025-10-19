import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from '@/components/ui/switch';

interface BracketSettings {
  cardWidth: number;
  cardGap: number;
  columnGap: number;
  fontSize: number;
  showMatchNumbers: boolean;
  showScores: boolean;
  compactMode: boolean;
}

interface BracketCustomizerProps {
  settings: BracketSettings;
  onSettingsChange: (settings: BracketSettings) => void;
}

const STORAGE_KEY = 'bracket-view-settings';

export default function BracketCustomizer({ settings, onSettingsChange }: BracketCustomizerProps) {
  const handleReset = () => {
    const defaults: BracketSettings = {
      cardWidth: 160,
      cardGap: 8,
      columnGap: 16,
      fontSize: 12,
      showMatchNumbers: true,
      showScores: true,
      compactMode: false,
    };
    onSettingsChange(defaults);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
  };

  const handleExport = () => {
    const json = JSON.stringify(settings, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bracket-settings.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        onSettingsChange(imported);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(imported));
      } catch (error) {
        console.error('Failed to import settings:', error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Icon name="Settings" size={16} className="mr-2" />
          Настроить вид
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Настройки турнирной сетки</SheetTitle>
          <SheetDescription>
            Настройте внешний вид турнирной сетки под свои нужды
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label className="text-sm">Ширина карточки: {settings.cardWidth}px</Label>
            <Slider
              value={[settings.cardWidth]}
              onValueChange={(v) => onSettingsChange({ ...settings, cardWidth: v[0] })}
              min={120}
              max={300}
              step={10}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Расстояние между матчами: {settings.cardGap}px</Label>
            <Slider
              value={[settings.cardGap]}
              onValueChange={(v) => onSettingsChange({ ...settings, cardGap: v[0] })}
              min={4}
              max={32}
              step={2}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Расстояние между раундами: {settings.columnGap}px</Label>
            <Slider
              value={[settings.columnGap]}
              onValueChange={(v) => onSettingsChange({ ...settings, columnGap: v[0] })}
              min={8}
              max={64}
              step={4}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Размер шрифта: {settings.fontSize}px</Label>
            <Slider
              value={[settings.fontSize]}
              onValueChange={(v) => onSettingsChange({ ...settings, fontSize: v[0] })}
              min={10}
              max={16}
              step={1}
            />
          </div>

          <div className="border-t pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Показывать номера матчей</Label>
              <Switch
                checked={settings.showMatchNumbers}
                onCheckedChange={(checked) => onSettingsChange({ ...settings, showMatchNumbers: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm">Показывать счёт</Label>
              <Switch
                checked={settings.showScores}
                onCheckedChange={(checked) => onSettingsChange({ ...settings, showScores: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm">Компактный режим</Label>
              <Switch
                checked={settings.compactMode}
                onCheckedChange={(checked) => onSettingsChange({ ...settings, compactMode: checked })}
              />
            </div>
          </div>

          <div className="border-t pt-4 space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="w-full"
            >
              <Icon name="RotateCcw" size={16} className="mr-2" />
              Сбросить настройки
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="w-full"
            >
              <Icon name="Download" size={16} className="mr-2" />
              Экспортировать настройки
            </Button>

            <Label htmlFor="import-settings" className="w-full">
              <div className="flex items-center justify-center gap-2 w-full h-9 px-4 py-2 border rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground text-sm">
                <Icon name="Upload" size={16} />
                Импортировать настройки
              </div>
              <Input
                id="import-settings"
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </Label>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export type { BracketSettings };
