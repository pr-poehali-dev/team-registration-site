import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import funcUrls from '../../backend/func2url.json';

const TEAMS_URL = funcUrls.teams;

export default function BracketImport() {
  const [teamsList, setTeamsList] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleImport = async () => {
    if (!teamsList.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите список команд',
        variant: 'destructive',
      });
      return;
    }

    const teams = teamsList.split('\n').map(t => t.trim()).filter(t => t.length > 0);

    if (teams.length < 2) {
      toast({
        title: 'Ошибка',
        description: 'Нужно минимум 2 команды',
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
          resource: 'import_teams_list',
          teams: teams,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Успешно',
          description: `Импортировано команд: ${data.teams_imported || 0}`,
        });
        setTeamsList('');
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
          Импортируйте список команд для автоматического добавления в базу
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Список команд (каждая с новой строки)</label>
          <Textarea
            value={teamsList}
            onChange={(e) => setTeamsList(e.target.value)}
            placeholder="Team Alpha\nTeam Bravo\nTeam Charlie\nTeam Delta"
            className="min-h-[200px] font-mono"
            disabled={loading}
          />
          <Button onClick={handleImport} disabled={loading || !teamsList.trim()} className="w-full">
            {loading ? (
              <>
                <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                Импорт...
              </>
            ) : (
              <>
                <Icon name="Download" size={18} className="mr-2" />
                Импортировать команды
              </>
            )}
          </Button>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Icon name="Info" size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm space-y-1">
              <p className="font-medium text-blue-500">Как использовать:</p>
              <ol className="space-y-1 text-muted-foreground list-decimal list-inside">
                <li>Скопируйте список команд из турнирной сетки (lvup.gg или любой другой)</li>
                <li>Вставьте команды в поле выше (каждая команда с новой строки)</li>
                <li>Нажмите "Импортировать команды"</li>
                <li>Команды автоматически добавятся со статусом "одобрено"</li>
              </ol>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}