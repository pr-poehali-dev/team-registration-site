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
      <h3 className="text-lg font-semibold">
        Редактировать матч #{selectedMatch.match_number}
      </h3>

      <div className="space-y-2">
        <Label>Команда 1</Label>
        <Select
          value={selectedMatch.team1_id?.toString() || ''}
          onValueChange={(value) =>
            onUpdateMatch({ ...selectedMatch, team1_id: parseInt(value) })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите команду" />
          </SelectTrigger>
          <SelectContent>
            {teams.map((team) => (
              <SelectItem key={team.id} value={team.id.toString()}>
                {team.team_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Команда 2</Label>
        <Select
          value={selectedMatch.team2_id?.toString() || ''}
          onValueChange={(value) =>
            onUpdateMatch({ ...selectedMatch, team2_id: parseInt(value) })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите команду" />
          </SelectTrigger>
          <SelectContent>
            {teams.map((team) => (
              <SelectItem key={team.id} value={team.id.toString()}>
                {team.team_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          value={selectedMatch.winner?.toString() || ''}
          onValueChange={(value) =>
            onUpdateMatch({
              ...selectedMatch,
              winner: value ? parseInt(value) : undefined,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите победителя" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Нет победителя</SelectItem>
            <SelectItem value="1">Команда 1</SelectItem>
            <SelectItem value="2">Команда 2</SelectItem>
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

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          <Icon name="Save" size={16} className="mr-2" />
          Сохранить
        </Button>
      </div>
    </form>
  );
}