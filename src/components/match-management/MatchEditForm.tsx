import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { Match, Team } from './types';

interface MatchEditFormProps {
  selectedMatch: Match | null;
  teams: Team[];
  onUpdateMatch: (match: Match) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function MatchEditForm({
  selectedMatch,
  teams,
  onUpdateMatch,
  onSubmit,
}: MatchEditFormProps) {
  if (!selectedMatch) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Icon name="Info" size={48} className="text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          Выберите матч из списка для редактирования
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Матч #{selectedMatch.match_number}
        </h3>
        <div className="text-xs text-muted-foreground">
          {selectedMatch.bracket_type} R{selectedMatch.round_number}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Команда 1</Label>
          {selectedMatch.team1_id && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onUpdateMatch({ ...selectedMatch, team1_id: null })}
              className="h-6 text-xs"
            >
              Очистить
            </Button>
          )}
        </div>
        <Select
          value={selectedMatch.team1_id?.toString() || 'none'}
          onValueChange={(value) =>
            onUpdateMatch({ ...selectedMatch, team1_id: value === 'none' ? null : parseInt(value) })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={selectedMatch.team1_placeholder || "Выберите команду"}>
              {selectedMatch.team1_name || selectedMatch.team1_placeholder || "Выберите команду"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">
              <span className="text-muted-foreground">Не выбрано</span>
            </SelectItem>
            {teams.map((team) => (
              <SelectItem key={team.id} value={team.id.toString()}>
                {team.team_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Команда 2</Label>
          {selectedMatch.team2_id && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onUpdateMatch({ ...selectedMatch, team2_id: null })}
              className="h-6 text-xs"
            >
              Очистить
            </Button>
          )}
        </div>
        <Select
          value={selectedMatch.team2_id?.toString() || 'none'}
          onValueChange={(value) =>
            onUpdateMatch({ ...selectedMatch, team2_id: value === 'none' ? null : parseInt(value) })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={selectedMatch.team2_placeholder || "Выберите команду"}>
              {selectedMatch.team2_name || selectedMatch.team2_placeholder || "Выберите команду"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">
              <span className="text-muted-foreground">Не выбрано</span>
            </SelectItem>
            {teams.map((team) => (
              <SelectItem key={team.id} value={team.id.toString()}>
                {team.team_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Плейсхолдер команды 1 (опционально)</Label>
        <Input
          type="text"
          value={selectedMatch.team1_placeholder || ''}
          onChange={(e) =>
            onUpdateMatch({
              ...selectedMatch,
              team1_placeholder: e.target.value,
            })
          }
          placeholder="Например: Победитель матча #1"
          className="text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Плейсхолдер команды 2 (опционально)</Label>
        <Input
          type="text"
          value={selectedMatch.team2_placeholder || ''}
          onChange={(e) =>
            onUpdateMatch({
              ...selectedMatch,
              team2_placeholder: e.target.value,
            })
          }
          placeholder="Например: Победитель матча #2"
          className="text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Счёт команды 1</Label>
          <Input
            type="number"
            min="0"
            value={selectedMatch.score1 ?? ''}
            onChange={(e) =>
              onUpdateMatch({
                ...selectedMatch,
                score1: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label>Счёт команды 2</Label>
          <Input
            type="number"
            min="0"
            value={selectedMatch.score2 ?? ''}
            onChange={(e) =>
              onUpdateMatch({
                ...selectedMatch,
                score2: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
            placeholder="0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Победитель</Label>
        <Select
          value={selectedMatch.winner?.toString() || 'none'}
          onValueChange={(value) => {
            const winnerId = value === 'none' ? null : 
                           value === 'team1' ? selectedMatch.team1_id :
                           value === 'team2' ? selectedMatch.team2_id : null;
            onUpdateMatch({
              ...selectedMatch,
              winner: winnerId,
            });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите победителя" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Нет победителя</SelectItem>
            {selectedMatch.team1_id && (
              <SelectItem value="team1">
                {selectedMatch.team1_name || 'Команда 1'}
              </SelectItem>
            )}
            {selectedMatch.team2_id && (
              <SelectItem value="team2">
                {selectedMatch.team2_name || 'Команда 2'}
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Статус</Label>
        <Select
          value={selectedMatch.status}
          onValueChange={(value) =>
            onUpdateMatch({ ...selectedMatch, status: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="upcoming">Ожидается</SelectItem>
            <SelectItem value="live">В эфире</SelectItem>
            <SelectItem value="finished">Завершён</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Время начала</Label>
        <Input
          type="datetime-local"
          value={selectedMatch.scheduled_time || ''}
          onChange={(e) =>
            onUpdateMatch({
              ...selectedMatch,
              scheduled_time: e.target.value,
            })
          }
        />
      </div>

      <div className="flex gap-2 pt-4 border-t">
        <Button 
          type="button" 
          variant="outline"
          onClick={() => {
            if (selectedMatch.score1 !== undefined && selectedMatch.score2 !== undefined) {
              const winnerId = selectedMatch.score1 > selectedMatch.score2 
                ? selectedMatch.team1_id 
                : selectedMatch.score2 > selectedMatch.score1 
                ? selectedMatch.team2_id 
                : null;
              onUpdateMatch({
                ...selectedMatch,
                winner: winnerId,
                status: 'finished'
              });
            }
          }}
          disabled={selectedMatch.score1 === undefined || selectedMatch.score2 === undefined}
          className="flex-1"
        >
          <Icon name="Trophy" size={16} className="mr-2" />
          Определить победителя
        </Button>
        <Button type="submit" className="flex-1">
          <Icon name="Save" size={16} className="mr-2" />
          Сохранить
        </Button>
      </div>
    </form>
  );
}