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
        className={`border rounded-lg transition-all ${
          isEditMode ? 'cursor-move' : 'cursor-pointer'
        } ${
          selectedMatch?.id === match.id
            ? 'border-primary bg-primary/10 shadow-md'
            : 'hover:border-primary/50 hover:shadow-sm'
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
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-primary">Верхняя сетка</h4>
          <div className={`flex pb-2 ${isEditMode ? '' : 'overflow-x-auto'}`} style={{ gap: `${settings.columnGap}px` }}>
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
          <div className={`flex pb-2 ${isEditMode ? '' : 'overflow-x-auto'}`} style={{ gap: `${settings.columnGap}px` }}>
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
    </div>
  );
}