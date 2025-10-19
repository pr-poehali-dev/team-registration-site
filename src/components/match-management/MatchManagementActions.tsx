import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import BracketGenerationDialog, { BracketSettings } from './BracketGenerationDialog';

interface MatchManagementActionsProps {
  generatingBracket: boolean;
  shufflingTeams: boolean;
  clearingBracket: boolean;
  exportingTeams: boolean;
  clearingTeams: boolean;
  teamCount: number;
  onGenerateBracket: (settings?: BracketSettings) => void;
  onShuffleTeams: () => void;
  onClearBracket: () => void;
  onToggleBulkCreate: () => void;
  onExportTeams: () => void;
  onClearAllTeams: () => void;
}

export default function MatchManagementActions({
  generatingBracket,
  shufflingTeams,
  clearingBracket,
  exportingTeams,
  clearingTeams,
  teamCount,
  onGenerateBracket,
  onShuffleTeams,
  onClearBracket,
  onToggleBulkCreate,
  onExportTeams,
  onClearAllTeams,
}: MatchManagementActionsProps) {
  const [showBracketDialog, setShowBracketDialog] = useState(false);

  const handleGenerateClick = () => {
    setShowBracketDialog(true);
  };

  const handleGenerateWithSettings = (settings: BracketSettings) => {
    onGenerateBracket(settings);
  };

  return (
    <>
    <div className="flex gap-2 flex-wrap w-full sm:w-auto">
      <BracketGenerationDialog
        open={showBracketDialog}
        onClose={() => setShowBracketDialog(false)}
        onGenerate={handleGenerateWithSettings}
        teamCount={teamCount}
      />
      <Button
        onClick={handleGenerateClick}
        disabled={generatingBracket}
        variant="default"
        size="sm"
        className="flex-1 sm:flex-none text-xs sm:text-sm"
      >
        {generatingBracket ? (
          <Icon name="Loader2" size={14} className="sm:mr-2 animate-spin" />
        ) : (
          <Icon name="GitBranch" size={14} className="sm:mr-2" />
        )}
        <span className="hidden sm:inline">Создать сетку</span>
      </Button>
      <Button
        onClick={onShuffleTeams}
        disabled={shufflingTeams}
        variant="outline"
        size="sm"
        className="flex-1 sm:flex-none text-xs sm:text-sm"
      >
        {shufflingTeams ? (
          <Icon name="Loader2" size={14} className="sm:mr-2 animate-spin" />
        ) : (
          <Icon name="Shuffle" size={14} className="sm:mr-2" />
        )}
        <span className="hidden sm:inline">Перемешать</span>
      </Button>
      <Button
        onClick={onClearBracket}
        disabled={clearingBracket}
        variant="outline"
        size="sm"
        className="flex-1 sm:flex-none text-xs sm:text-sm"
      >
        {clearingBracket ? (
          <Icon name="Loader2" size={14} className="sm:mr-2 animate-spin" />
        ) : (
          <Icon name="Trash2" size={14} className="sm:mr-2" />
        )}
        <span className="hidden sm:inline">Очистить</span>
      </Button>
      <Button
        onClick={onToggleBulkCreate}
        variant="outline"
        size="sm"
        className="flex-1 sm:flex-none text-xs sm:text-sm"
      >
        <Icon name="Plus" size={14} className="sm:mr-2" />
        <span className="hidden sm:inline">Добавить</span>
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
    </>
  );
}