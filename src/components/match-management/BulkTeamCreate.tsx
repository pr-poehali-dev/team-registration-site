import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface BulkTeamCreateProps {
  bulkTeamNames: string;
  setBulkTeamNames: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  creatingTeams: boolean;
}

export default function BulkTeamCreate({
  bulkTeamNames,
  setBulkTeamNames,
  onClose,
  onSubmit,
  creatingTeams,
}: BulkTeamCreateProps) {
  const teamCount = bulkTeamNames.split('\n').filter(n => n.trim().length > 0).length;

  return (
    <div className="mb-6 p-4 border rounded-lg bg-muted/30">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Массовое создание команд</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <Icon name="X" size={16} />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Введите названия команд (каждая команда с новой строки)
        </p>
        <textarea
          className="w-full min-h-[200px] p-3 rounded-md border bg-background font-mono text-sm"
          placeholder="Team Alpha&#10;Team Bravo&#10;Team Charlie&#10;Team Delta&#10;Team Echo&#10;Team Foxtrot&#10;Team Golf&#10;Team Hotel"
          value={bulkTeamNames}
          onChange={(e) => setBulkTeamNames(e.target.value)}
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Команд для создания: {teamCount}
          </p>
          <Button
            onClick={onSubmit}
            disabled={creatingTeams}
          >
            {creatingTeams ? (
              <>
                <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                Создание...
              </>
            ) : (
              <>
                <Icon name="CheckCircle" size={16} className="mr-2" />
                Создать команды
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
