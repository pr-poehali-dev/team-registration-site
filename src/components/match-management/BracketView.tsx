import { Match } from './types';
import { useState, useEffect, useRef } from 'react';
import BracketCustomizer, { BracketSettings } from './BracketCustomizer';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface BracketViewProps {
  matches: Match[];
  selectedMatch: Match | null;
  onSelectMatch: (match: Match) => void;
}

const STORAGE_KEY = 'bracket-view-settings';
const POSITIONS_KEY = 'bracket-custom-positions';

interface CardPosition {
  x: number;
  y: number;
}

type CustomPositions = { [matchId: string]: CardPosition };

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
  const [isEditMode, setIsEditMode] = useState(false);
  const [customPositions, setCustomPositions] = useState<CustomPositions>({});
  const [draggedMatch, setDraggedMatch] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(POSITIONS_KEY);
      if (saved) {
        setCustomPositions(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load custom positions:', e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(POSITIONS_KEY, JSON.stringify(customPositions));
  }, [customPositions]);

  const handleMouseDown = (e: React.MouseEvent, matchId: string) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.stopPropagation();
    
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    
    if (containerRect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setDraggedMatch(matchId);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!draggedMatch || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - containerRect.left - dragOffset.x;
    const y = e.clientY - containerRect.top - dragOffset.y;
    
    setCustomPositions(prev => ({
      ...prev,
      [draggedMatch]: { x, y }
    }));
  };

  const handleMouseUp = () => {
    setDraggedMatch(null);
  };

  useEffect(() => {
    if (draggedMatch) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedMatch, dragOffset]);

  const resetPositions = () => {
    setCustomPositions({});
    localStorage.removeItem(POSITIONS_KEY);
  };
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

  const renderMatch = (match: Match, defaultX?: number, defaultY?: number) => {
    const position = customPositions[match.id];
    const isCustomPositioned = isEditMode && position;
    
    const getBracketColor = () => {
      if (match.bracket_type === 'upper') return 'border-blue-200 bg-blue-50/30 hover:border-blue-400';
      if (match.bracket_type === 'lower') return 'border-orange-200 bg-orange-50/30 hover:border-orange-400';
      if (match.bracket_type === 'grand_final') return 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50 hover:border-yellow-500 shadow-md';
      return 'border-gray-200 bg-white hover:border-gray-400';
    };
    
    const getLeftBorderColor = () => {
      if (match.bracket_type === 'upper') return 'border-l-4 border-l-blue-500';
      if (match.bracket_type === 'lower') return 'border-l-4 border-l-orange-500';
      if (match.bracket_type === 'grand_final') return 'border-l-4 border-l-yellow-500';
      return '';
    };
    
    return (
      <div
        key={match.id}
        onClick={() => !isEditMode && onSelectMatch(match)}
        onMouseDown={(e) => handleMouseDown(e, match.id)}
        style={{ 
          width: `${settings.cardWidth}px`,
          fontSize: `${settings.fontSize}px`,
          padding: settings.compactMode ? '6px' : '8px',
          ...(isCustomPositioned ? {
            position: 'absolute',
            left: `${position.x}px`,
            top: `${position.y}px`,
            zIndex: draggedMatch === match.id ? 1000 : 1
          } : {})
        }}
        className={`border-2 rounded-lg transition-all ${getLeftBorderColor()} ${
          isEditMode ? 'cursor-move' : 'cursor-pointer'
        } ${
          selectedMatch?.id === match.id
            ? 'border-primary bg-primary/10 shadow-lg ring-2 ring-primary/20'
            : getBracketColor()
        } ${
          isCustomPositioned ? 'shadow-lg' : ''
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
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-sm font-medium">Турнирная сетка</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1 border rounded-md">
            <Switch 
              id="edit-mode" 
              checked={isEditMode} 
              onCheckedChange={setIsEditMode}
            />
            <Label htmlFor="edit-mode" className="text-xs cursor-pointer">
              {isEditMode ? 'Режим редактирования' : 'Обычный режим'}
            </Label>
          </div>
          {isEditMode && Object.keys(customPositions).length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={resetPositions}
            >
              <Icon name="RotateCcw" size={14} className="mr-1" />
              Сбросить позиции
            </Button>
          )}
          <BracketCustomizer settings={settings} onSettingsChange={setSettings} />
        </div>
      </div>
      {isEditMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800">
          <div className="flex items-start gap-2">
            <Icon name="Info" size={16} className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium mb-1">Режим ручного редактирования активен</p>
              <p className="text-xs">Перетаскивайте карточки матчей мышью для изменения их расположения. Позиции сохраняются автоматически.</p>
            </div>
          </div>
        </div>
      )}

      <div ref={containerRef} className={isEditMode ? 'relative min-h-[600px]' : ''}>
      {upperRounds.length > 0 && (
        <div className="space-y-3 border-2 border-blue-200 rounded-xl p-4 bg-gradient-to-br from-blue-50/50 to-transparent">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
            <Icon name="TrendingUp" size={18} className="text-blue-600" />
            <h4 className="text-sm font-bold text-blue-700 uppercase tracking-wide">Верхняя сетка</h4>
            <div className="ml-auto text-xs text-blue-600 font-medium bg-blue-100 px-2 py-1 rounded-full">
              {upperRounds.length} раунд{upperRounds.length === 1 ? '' : upperRounds.length < 5 ? 'а' : 'ов'}
            </div>
          </div>
          <div className={`flex pb-2 ${isEditMode ? '' : 'overflow-x-auto'}`} style={{ gap: `${settings.columnGap}px` }}>
            {upperRounds.map(round => (
              <div key={`upper-${round}`} className="flex flex-col" style={{ gap: `${settings.cardGap}px`, minWidth: `${settings.cardWidth}px` }}>
                <div className="text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1.5 rounded-lg sticky top-0 shadow-sm border border-blue-200">
                  <Icon name="Trophy" size={12} className="inline mr-1" />
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
        <div className="space-y-3 border-2 border-orange-200 rounded-xl p-4 bg-gradient-to-br from-orange-50/50 to-transparent mt-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-6 bg-orange-500 rounded-full"></div>
            <Icon name="TrendingDown" size={18} className="text-orange-600" />
            <h4 className="text-sm font-bold text-orange-700 uppercase tracking-wide">Нижняя сетка</h4>
            <div className="ml-auto text-xs text-orange-600 font-medium bg-orange-100 px-2 py-1 rounded-full">
              {lowerRounds.length} раунд{lowerRounds.length === 1 ? '' : lowerRounds.length < 5 ? 'а' : 'ов'}
            </div>
          </div>
          <div className={`flex pb-2 ${isEditMode ? '' : 'overflow-x-auto'}`} style={{ gap: `${settings.columnGap}px` }}>
            {lowerRounds.map(round => (
              <div key={`lower-${round}`} className="flex flex-col" style={{ gap: `${settings.cardGap}px`, minWidth: `${settings.cardWidth}px` }}>
                <div className="text-xs font-bold text-orange-700 bg-orange-100 px-3 py-1.5 rounded-lg sticky top-0 shadow-sm border border-orange-200">
                  <Icon name="AlertCircle" size={12} className="inline mr-1" />
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
        <div className="space-y-3 border-2 border-yellow-300 rounded-xl p-4 bg-gradient-to-br from-yellow-50 via-amber-50/50 to-transparent mt-4 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-6 bg-gradient-to-b from-yellow-400 to-amber-500 rounded-full shadow-md"></div>
            <Icon name="Crown" size={20} className="text-yellow-600" />
            <h4 className="text-sm font-bold text-yellow-700 uppercase tracking-wide">Гранд-финал</h4>
            <div className="ml-auto">
              <Icon name="Star" size={16} className="text-yellow-500 animate-pulse" />
            </div>
          </div>
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
    </div>
  );
}