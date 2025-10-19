import { Match } from './types';
import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/icon';
import BracketCustomizer, { BracketSettings } from './BracketCustomizer';

interface BracketViewVerticalProps {
  matches: Match[];
  selectedMatch: Match | null;
  onSelectMatch: (match: Match) => void;
}

const STORAGE_KEY = 'bracket-view-settings';

export default function BracketViewVertical({ matches, selectedMatch, onSelectMatch }: BracketViewVerticalProps) {
  const loadSettings = (): BracketSettings => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const settings = JSON.parse(saved);
        return {
          cardWidth: settings.cardWidth ?? 180,
          cardGap: settings.cardGap ?? 16,
          columnGap: settings.columnGap ?? 80,
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
      cardWidth: 180,
      cardGap: 16,
      columnGap: 80,
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

  const renderMatch = (match: Match, bracketType: 'upper' | 'lower' | 'grand_final') => {
    const getBracketStyles = () => {
      if (bracketType === 'upper') {
        return {
          border: 'border-l-4 border-l-blue-500 border border-blue-200',
          bg: 'bg-gradient-to-r from-blue-50/50 to-transparent',
          hover: 'hover:border-blue-400 hover:shadow-blue-100'
        };
      }
      if (bracketType === 'lower') {
        return {
          border: 'border-l-4 border-l-orange-500 border border-orange-200',
          bg: 'bg-gradient-to-r from-orange-50/50 to-transparent',
          hover: 'hover:border-orange-400 hover:shadow-orange-100'
        };
      }
      return {
        border: 'border-l-4 border-l-yellow-500 border-2 border-yellow-300',
        bg: 'bg-gradient-to-r from-yellow-50 to-amber-50/50',
        hover: 'hover:border-yellow-500 hover:shadow-yellow-100'
      };
    };

    const styles = getBracketStyles();

    return (
      <div
        key={match.id}
        onClick={() => onSelectMatch(match)}
        style={{ 
          width: `${settings.cardWidth}px`,
          fontSize: `${settings.fontSize}px`,
        }}
        className={`
          ${styles.border} ${styles.bg} ${styles.hover}
          rounded-lg cursor-pointer transition-all p-3
          ${selectedMatch?.id === match.id
            ? 'ring-2 ring-primary shadow-lg scale-105'
            : 'shadow-sm'
          }
        `}
      >
        {settings.showMatchNumbers && (
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-muted-foreground font-mono">
              #{match.match_number}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
              match.status === 'finished' ? 'bg-green-500 text-white' :
              match.status === 'live' ? 'bg-red-500 text-white animate-pulse' :
              'bg-gray-300 text-gray-700'
            }`}>
              {match.status === 'finished' ? '✓' : match.status === 'live' ? 'LIVE' : '—'}
            </span>
          </div>
        )}
        
        <div className="space-y-2">
          <div className={`truncate font-semibold ${
            match.winner === match.team1_id ? 'text-green-700' : ''
          }`}>
            {match.team1_name || match.team1_placeholder || 'TBD'}
          </div>
          
          {settings.showScores && match.score1 !== undefined && match.score2 !== undefined ? (
            <div className="flex items-center justify-center gap-2 text-sm font-bold bg-background/80 rounded py-1">
              <span className={match.winner === match.team1_id ? 'text-green-600' : ''}>
                {match.score1}
              </span>
              <span className="text-muted-foreground">:</span>
              <span className={match.winner === match.team2_id ? 'text-green-600' : ''}>
                {match.score2}
              </span>
            </div>
          ) : (
            <div className="text-center text-xs text-muted-foreground">vs</div>
          )}
          
          <div className={`truncate font-semibold ${
            match.winner === match.team2_id ? 'text-green-700' : ''
          }`}>
            {match.team2_name || match.team2_placeholder || 'TBD'}
          </div>
        </div>
      </div>
    );
  };

  const renderConnectorLines = (roundIndex: number, matchCount: number, nextMatchCount: number) => {
    if (nextMatchCount === 0) return null;
    
    return (
      <div className="relative" style={{ width: `${settings.columnGap}px` }}>
        <svg 
          width={settings.columnGap} 
          height={matchCount * (settings.cardGap + 120)}
          className="absolute top-0 left-0"
          style={{ overflow: 'visible' }}
        >
          {Array.from({ length: Math.ceil(matchCount / 2) }).map((_, i) => {
            const y1 = i * 2 * (settings.cardGap + 120) + 60;
            const y2 = (i * 2 + 1) * (settings.cardGap + 120) + 60;
            const yMid = (y1 + y2) / 2;
            const xMid = settings.columnGap / 2;
            const xEnd = settings.columnGap;

            return (
              <g key={i}>
                {/* Horizontal lines from matches */}
                <line
                  x1={0}
                  y1={y1}
                  x2={xMid}
                  y2={y1}
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-gray-400"
                />
                <line
                  x1={0}
                  y1={y2}
                  x2={xMid}
                  y2={y2}
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-gray-400"
                />
                {/* Vertical connector */}
                <line
                  x1={xMid}
                  y1={y1}
                  x2={xMid}
                  y2={y2}
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-gray-400"
                />
                {/* Line to next match */}
                <line
                  x1={xMid}
                  y1={yMid}
                  x2={xEnd}
                  y2={yMid}
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-gray-400"
                />
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Турнирная сетка</h3>
        <BracketCustomizer settings={settings} onSettingsChange={setSettings} />
      </div>

      {/* Upper Bracket */}
      {upperRounds.length > 0 && (
        <div className="border-2 border-blue-200 rounded-xl p-6 bg-gradient-to-br from-blue-50/30 to-transparent">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
            <Icon name="TrendingUp" size={18} className="text-blue-600" />
            <h4 className="text-sm font-bold text-blue-700 uppercase tracking-wide">Верхняя сетка</h4>
            <div className="ml-auto text-xs text-blue-600 font-medium bg-blue-100 px-3 py-1 rounded-full">
              {upperRounds.length} этап{upperRounds.length === 1 ? '' : upperRounds.length < 5 ? 'а' : 'ов'}
            </div>
          </div>

          <div className="flex items-start overflow-x-auto pb-4">
            {upperRounds.map((round, roundIndex) => {
              const roundMatches = brackets.upper[round] || [];
              const nextRoundMatches = brackets.upper[round + 1] || [];
              
              return (
                <div key={`upper-${round}`} className="flex items-start">
                  <div className="flex flex-col" style={{ minWidth: `${settings.cardWidth}px` }}>
                    <div className="mb-4 text-center">
                      <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-bold text-sm border-2 border-blue-300">
                        <Icon name="Trophy" size={14} />
                        Этап {round}
                      </div>
                    </div>
                    <div className="flex flex-col" style={{ gap: `${settings.cardGap}px` }}>
                      {roundMatches.map(match => renderMatch(match, 'upper'))}
                    </div>
                  </div>
                  {roundIndex < upperRounds.length - 1 && renderConnectorLines(
                    roundIndex,
                    roundMatches.length,
                    nextRoundMatches.length
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lower Bracket */}
      {lowerRounds.length > 0 && (
        <div className="border-2 border-orange-200 rounded-xl p-6 bg-gradient-to-br from-orange-50/30 to-transparent">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-orange-500 rounded-full"></div>
            <Icon name="TrendingDown" size={18} className="text-orange-600" />
            <h4 className="text-sm font-bold text-orange-700 uppercase tracking-wide">Нижняя сетка</h4>
            <div className="ml-auto text-xs text-orange-600 font-medium bg-orange-100 px-3 py-1 rounded-full">
              {lowerRounds.length} этап{lowerRounds.length === 1 ? '' : lowerRounds.length < 5 ? 'а' : 'ов'}
            </div>
          </div>

          <div className="flex items-start overflow-x-auto pb-4">
            {lowerRounds.map((round, roundIndex) => {
              const roundMatches = brackets.lower[round] || [];
              const nextRoundMatches = brackets.lower[round + 1] || [];
              
              return (
                <div key={`lower-${round}`} className="flex items-start">
                  <div className="flex flex-col" style={{ minWidth: `${settings.cardWidth}px` }}>
                    <div className="mb-4 text-center">
                      <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-lg font-bold text-sm border-2 border-orange-300">
                        <Icon name="AlertCircle" size={14} />
                        Этап {round}
                      </div>
                    </div>
                    <div className="flex flex-col" style={{ gap: `${settings.cardGap}px` }}>
                      {roundMatches.map(match => renderMatch(match, 'lower'))}
                    </div>
                  </div>
                  {roundIndex < lowerRounds.length - 1 && renderConnectorLines(
                    roundIndex,
                    roundMatches.length,
                    nextRoundMatches.length
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grand Final */}
      {hasGrandFinal && (
        <div className="border-2 border-yellow-300 rounded-xl p-6 bg-gradient-to-br from-yellow-50 via-amber-50/50 to-transparent shadow-lg">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-gradient-to-b from-yellow-400 to-amber-500 rounded-full"></div>
            <Icon name="Crown" size={20} className="text-yellow-600" />
            <h4 className="text-sm font-bold text-yellow-700 uppercase tracking-wide">Гранд-финал</h4>
            <Icon name="Star" size={16} className="text-yellow-500 ml-auto animate-pulse" />
          </div>

          <div className="flex justify-center">
            {brackets.grand_final[1].map(match => renderMatch(match, 'grand_final'))}
          </div>
        </div>
      )}

      {matches.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          Турнирная сетка пуста
        </p>
      )}
    </div>
  );
}
