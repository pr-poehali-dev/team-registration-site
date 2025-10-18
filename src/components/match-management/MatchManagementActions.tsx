import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface MatchManagementActionsProps {
  generatingBracket: boolean;
  shufflingTeams: boolean;
  clearingBracket: boolean;
  exportingTeams: boolean;
  clearingTeams: boolean;
  onGenerateBracket: () => void;
  onShuffleTeams: () => void;
  onClearBracket: () => void;
  onToggleBulkCreate: () => void;
  onToggleChallongeImport: () => void;
  onExportTeams: () => void;
  onClearAllTeams: () => void;
}

export default function MatchManagementActions({
  generatingBracket,
  shufflingTeams,
  clearingBracket,
  exportingTeams,
  clearingTeams,
  onGenerateBracket,
  onShuffleTeams,
  onClearBracket,
  onToggleBulkCreate,
  onToggleChallongeImport,
  onExportTeams,
  onClearAllTeams,
}: MatchManagementActionsProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      <Button
        onClick={onGenerateBracket}
        disabled={generatingBracket}
        variant="default"
        size="sm"
      >
        {generatingBracket ? (
          <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
        ) : (
          <Icon name="GitBranch" size={16} className="mr-2" />
        )}
        Создать сетку
      </Button>
      <Button
        onClick={onShuffleTeams}
        disabled={shufflingTeams}
        variant="outline"
        size="sm"
      >
        {shufflingTeams ? (
          <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
        ) : (
          <Icon name="Shuffle" size={16} className="mr-2" />
        )}
        Перемешать команды
      </Button>
      <Button
        onClick={onClearBracket}
        disabled={clearingBracket}
        variant="outline"
        size="sm"
      >
        {clearingBracket ? (
          <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
        ) : (
          <Icon name="Trash2" size={16} className="mr-2" />
        )}
        Очистить сетку
      </Button>
      <Button
        onClick={onToggleBulkCreate}
        variant="outline"
        size="sm"
      >
        <Icon name="Plus" size={16} className="mr-2" />
        Добавить команды
      </Button>
      <Button
        onClick={onToggleChallongeImport}
        variant="outline"
        size="sm"
      >
        <Icon name="Download" size={16} className="mr-2" />
        Импорт Challonge
      </Button>
      <Button
        onClick={onExportTeams}
        disabled={exportingTeams}
        variant="outline"
        size="sm"
      >
        {exportingTeams ? (
          <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
        ) : (
          <Icon name="Download" size={16} className="mr-2" />
        )}
        Экспорт (CSV)
      </Button>
      <Button
        onClick={() => {
          if (confirm('Вы уверены? Это удалит ВСЕ команды и матчи из базы данных!')) {
            onClearAllTeams();
          }
        }}
        disabled={clearingTeams}
        variant="destructive"
        size="sm"
      >
        {clearingTeams ? (
          <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
        ) : (
          <Icon name="XCircle" size={16} className="mr-2" />
        )}
        Очистить всё
      </Button>
    </div>
  );
}