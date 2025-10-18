import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import funcUrls from '../../backend/func2url.json';

const TEAMS_URL = funcUrls.teams;

export default function BracketImport() {
  const [lvupUrl, setLvupUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleImport = async () => {
    if (!lvupUrl.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите ссылку на турнирную сетку lvup.gg',
        variant: 'destructive',
      });
      return;
    }

    if (!lvupUrl.includes('lvup.gg')) {
      toast({
        title: 'Ошибка',
        description: 'Некорректная ссылка. Используйте ссылку с lvup.gg',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(TEAMS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resource: 'import_lvup',
          lvup_url: lvupUrl.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Успешно',
          description: `Импортировано команд: ${data.teams_imported || 0}, матчей: ${data.matches_imported || 0}`,
        });
        setLvupUrl('');
      } else {
        toast({
          title: 'Ошибка импорта',
          description: data.message || 'Не удалось импортировать данные',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Проблема с подключением к серверу',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Download" size={24} className="text-primary" />
          Импорт турнирной сетки
        </CardTitle>
        <CardDescription>
          Загрузите готовую сетку с lvup.gg для автоматического создания команд и матчей
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Ссылка на турнир lvup.gg</label>
          <div className="flex gap-2">
            <Input
              value={lvupUrl}
              onChange={(e) => setLvupUrl(e.target.value)}
              placeholder="https://lvup.gg/ru/easy/bracket/..."
              className="flex-1"
              disabled={loading}
            />
            <Button onClick={handleImport} disabled={loading || !lvupUrl.trim()}>
              {loading ? (
                <>
                  <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                  Импорт...
                </>
              ) : (
                <>
                  <Icon name="Download" size={18} className="mr-2" />
                  Импортировать
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Icon name="Info" size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm space-y-1">
              <p className="font-medium text-blue-500">Как использовать:</p>
              <ol className="space-y-1 text-muted-foreground list-decimal list-inside">
                <li>Создайте турнир на lvup.gg и заполните участников</li>
                <li>Скопируйте ссылку на страницу турнира</li>
                <li>Вставьте ссылку в поле выше и нажмите "Импортировать"</li>
                <li>Система автоматически создаст команды и матчи в базе</li>
              </ol>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
