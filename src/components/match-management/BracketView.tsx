import { Match } from './types';
import { useState, useEffect } from 'react';
import BracketCustomizer, { BracketSettings } from './BracketCustomizer';

interface BracketViewProps {
  matches: Match[];
  selectedMatch: Match | null;
  onSelectMatch: (match: Match) => void;
}

const STORAGE_KEY = 'bracket-view-settings';

export default function BracketView({ matches, selectedMatch, onSelectMatch }: BracketViewProps) {
  const loadSettings = (): BracketSettings => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const settings = JSON.parse(saved);
        return {
          cardWidth: settings.cardWidth ?? 160,
          cardGap: settings.cardGap ?? 8,
          columnGap: settings.columnGap ?? 16,
          fontSize: settings.fontSize ?? 12,
          showMatchNumbers: settings.showMatchNumbers ?? true,
          showScores: settings.showScores ?? true,
          compactMode: settings.compactMode ?? false,
        };
      }
    } catch (e) {
      console.error('Failed to load bracket settings:', e);
    }
    return {
      cardWidth: 160,
      cardGap: 8,
      columnGap: 16,
      fontSize: 12,
      showMatchNumbers: true,
      showScores: true,
      compactMode: false,
    };
  };

  const [settings, setSettings] = useState<BracketSettings>(loadSettings());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);
  const groupByBracketAndRound = () => {
    const brackets: { [key: string]: { [key: number]: Match[] } } = {
      upper: {},
      lower: {},
      grand_final: {}
    };

    matches.forEach(match => {
      if (!brackets[match.bracket_type][match.round_number]) {
        brackets[match.bracket_type][match.round_number] = [];
      }
      brackets[match.bracket_type][match.round_number].push(match);
    });

    return brackets;
  };

  const brackets = groupByBracketAndRound();
  const upperRounds = Object.keys(brackets.upper).map(Number).sort((a, b) => a - b);
  const lowerRounds = Object.keys(brackets.lower).map(Number).sort((a, b) => a - b);
  const hasGrandFinal = brackets.grand_final[1]?.length > 0;

  const renderMatch = (match: Match) => (
    <div
      key={match.id}
      onClick={() => onSelectMatch(match)}
      style={{ 
        width: `${settings.cardWidth}px`,
        fontSize: `${settings.fontSize}px`,
        padding: settings.compactMode ? '6px' : '8px'
      }}
      className={`border rounded-lg cursor-pointer transition-all ${
        selectedMatch?.id === match.id
          ? 'border-primary bg-primary/10 shadow-md'
          : 'hover:border-primary/50 hover:shadow-sm'
      }`}
    >
      {settings.showMatchNumbers && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-muted-foreground font-mono">
            #{match.match_number}
          </span>
          <span className={`text-[10px] px-1 py-0.5 rounded ${
            match.status === 'finished' ? 'bg-green-500/20 text-green-700' :
            match.status === 'live' ? 'bg-red-500/20 text-red-700' :
            'bg-gray-500/20 text-gray-700'
          }`}>
            {match.status === 'finished' ? '✓' : match.status === 'live' ? '●' : '○'}
          </span>
        </div>
      )}
      <div className={settings.compactMode ? 'space-y-0' : 'space-y-0.5'}>
        <div className="truncate font-medium">
          {match.team1_name || match.team1_placeholder || 'TBD'}
        </div>
        {!settings.compactMode && <div className="text-[10px] text-muted-foreground">vs</div>}
        <div className="truncate font-medium">
          {match.team2_name || match.team2_placeholder || 'TBD'}
        </div>
      </div>
      {settings.showScores && match.score1 !== undefined && match.score2 !== undefined && (
        <div className="text-xs font-bold mt-1 text-center">
          {match.score1} : {match.score2}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Турнирная сетка</h3>
        <BracketCustomizer settings={settings} onSettingsChange={setSettings} />
      </div>

      {upperRounds.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-primary">Верхняя сетка</h4>
          <div className="flex overflow-x-auto pb-2" style={{ gap: `${settings.columnGap}px` }}>
            {upperRounds.map(round => (
              <div key={`upper-${round}`} className="flex flex-col" style={{ gap: `${settings.cardGap}px`, minWidth: `${settings.cardWidth}px` }}>
                <div className="text-xs font-medium text-muted-foreground sticky top-0 bg-background pb-1">
                  Раунд {round}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: `${settings.cardGap}px` }}>
                  {brackets.upper[round].map(match => renderMatch(match))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {lowerRounds.length > 0 && (
        <div className="space-y-2 border-t pt-4">
          <h4 className="text-sm font-semibold text-orange-600">Нижняя сетка</h4>
          <div className="flex overflow-x-auto pb-2" style={{ gap: `${settings.columnGap}px` }}>
            {lowerRounds.map(round => (
              <div key={`lower-${round}`} className="flex flex-col" style={{ gap: `${settings.cardGap}px`, minWidth: `${settings.cardWidth}px` }}>
                <div className="text-xs font-medium text-muted-foreground sticky top-0 bg-background pb-1">
                  Раунд {round}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: `${settings.cardGap}px` }}>
                  {brackets.lower[round].map(match => renderMatch(match))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasGrandFinal && (
        <div className="space-y-2 border-t pt-4">
          <h4 className="text-sm font-semibold text-yellow-600">Гранд-финал</h4>
          <div className="flex" style={{ gap: `${settings.columnGap}px` }}>
            <div className="flex flex-col" style={{ gap: `${settings.cardGap}px`, minWidth: `${settings.cardWidth}px` }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: `${settings.cardGap}px` }}>
                {brackets.grand_final[1].map(match => renderMatch(match))}
              </div>
            </div>
          </div>
        </div>
      )}

      {matches.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          Турнирная сетка пуста
        </p>
      )}
    </div>
  );
}