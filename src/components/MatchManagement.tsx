import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import BulkTeamCreate from './match-management/BulkTeamCreate';
import MatchList from './match-management/MatchList';
import MatchEditForm from './match-management/MatchEditForm';
import MatchManagementActions from './match-management/MatchManagementActions';
import { useMatchManagement } from './match-management/useMatchManagement';

export default function MatchManagement() {
  const {
    matches,
    teams,
    selectedMatch,
    setSelectedMatch,
    loading,
    exportingTeams,
    showBulkCreate,
    setShowBulkCreate,

    bulkTeamNames,
    setBulkTeamNames,
    creatingTeams,
    generatingBracket,
    clearingBracket,
    shufflingTeams,
    clearingTeams,
    handleExportTeams,
    handleBulkCreate,
    handleGenerateBracket,
    handleClearBracket,
    handleShuffleTeams,
    handleClearAllTeams,

    handleUpdateMatch,
  } = useMatchManagement();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="Loader2" size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Icon name="Swords" size={20} className="text-primary sm:w-6 sm:h-6" />
              <CardTitle className="text-lg sm:text-xl">Управление матчами</CardTitle>
            </div>
            <MatchManagementActions
              generatingBracket={generatingBracket}
              shufflingTeams={shufflingTeams}
              clearingBracket={clearingBracket}
              exportingTeams={exportingTeams}
              clearingTeams={clearingTeams}
              onGenerateBracket={handleGenerateBracket}
              onShuffleTeams={handleShuffleTeams}
              onClearBracket={handleClearBracket}
              onToggleBulkCreate={() => setShowBulkCreate(!showBulkCreate)}
              onExportTeams={handleExportTeams}
              onClearAllTeams={handleClearAllTeams}
            />
          </div>
          <CardDescription>
            Редактирование результатов матчей и обновление турнирной сетки
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showBulkCreate && (
            <BulkTeamCreate
              bulkTeamNames={bulkTeamNames}
              setBulkTeamNames={setBulkTeamNames}
              onClose={() => setShowBulkCreate(false)}
              onSubmit={handleBulkCreate}
              creatingTeams={creatingTeams}
            />
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <MatchList
              matches={matches}
              selectedMatch={selectedMatch}
              onSelectMatch={setSelectedMatch}
            />
            <MatchEditForm
              selectedMatch={selectedMatch}
              teams={teams}
              onUpdateMatch={setSelectedMatch}
              onSubmit={handleUpdateMatch}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}