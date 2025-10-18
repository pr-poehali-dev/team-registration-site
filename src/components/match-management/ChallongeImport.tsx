import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface ChallongeImportProps {
  onClose: () => void;
  onImport: (url: string) => void;
  importing: boolean;
}

export default function ChallongeImport({ onClose, onImport, importing }: ChallongeImportProps) {
  const [challongeUrl, setChallongeUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (challongeUrl.trim()) {
      onImport(challongeUrl.trim());
    }
  };

  return (
    <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon name="Download" size={20} className="text-blue-600" />
          <h3 className="font-semibold text-blue-900">Импорт с Challonge</h3>
        </div>
        <Button onClick={onClose} variant="ghost" size="sm">
          <Icon name="X" size={16} />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="challonge-url">Ссылка на турнир Challonge</Label>
          <Input
            id="challonge-url"
            type="text"
            value={challongeUrl}
            onChange={(e) => setChallongeUrl(e.target.value)}
            placeholder="https://challonge.com/ru/your_tournament"
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Пример: https://challonge.com/ru/my_tournament или challonge.com/my_tournament
          </p>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={importing || !challongeUrl.trim()}>
            {importing ? (
              <>
                <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                Импортируем...
              </>
            ) : (
              <>
                <Icon name="Download" size={16} className="mr-2" />
                Импортировать
              </>
            )}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Отмена
          </Button>
        </div>
      </form>
    </Card>
  );
}
