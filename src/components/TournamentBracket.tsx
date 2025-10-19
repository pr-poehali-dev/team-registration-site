import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface BracketMatch {
  id: number;
  team1: string;
  team2: string;
  score1?: number;
  score2?: number;
  winner?: 1 | 2;
}

interface BracketProps {
  upperMatches: BracketMatch[][];
  lowerMatches: BracketMatch[][];
  finals?: BracketMatch;
  onUpdateMatch?: (matchId: number, score1: number, score2: number) => void;
  onSwapMatches?: (match1Id: number, match2Id: number) => void;
  isEditable?: boolean;
}

export default function TournamentBracket({ upperMatches, lowerMatches, finals, onUpdateMatch, onSwapMatches, isEditable = false }: BracketProps) {
  const [editingMatch, setEditingMatch] = useState<BracketMatch | null>(null);
  const [score1, setScore1] = useState('');
  const [score2, setScore2] = useState('');
  const [draggedMatch, setDraggedMatch] = useState<BracketMatch | null>(null);

  const handleEditClick = (match: BracketMatch) => {
    setEditingMatch(match);
    setScore1(match.score1?.toString() || '');
    setScore2(match.score2?.toString() || '');
  };

  const handleSave = () => {
    if (editingMatch && onUpdateMatch) {
      const s1 = parseInt(score1) || 0;
      const s2 = parseInt(score2) || 0;
      onUpdateMatch(editingMatch.id, s1, s2);
      setEditingMatch(null);
    }
  };

  const MatchBox = ({ match, isWinner }: { match: BracketMatch; isWinner?: boolean }) => {
    const team1Won = match.winner === 1;
    const team2Won = match.winner === 2;
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragStart = (e: React.DragEvent) => {
      if (!isEditable) return;
      e.stopPropagation();
      setDraggedMatch(match);
      e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnter = (e: React.DragEvent) => {
      if (!isEditable || !draggedMatch || draggedMatch.id === match.id) return;
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
      if (!isEditable) return;
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
      if (!isEditable || !draggedMatch) return;
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent) => {
      if (!isEditable || !draggedMatch || draggedMatch.id === match.id) return;
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      
      if (onSwapMatches) {
        onSwapMatches(draggedMatch.id, match.id);
      }
      setDraggedMatch(null);
    };

    const handleDragEnd = () => {
      setDraggedMatch(null);
      setIsDragOver(false);
    };

    return (
      <div 
        className={`bg-card border rounded-lg overflow-hidden relative group transition-all ${
          isWinner ? 'border-yellow-500 shadow-lg' : 'border-border'
        } ${
          isEditable ? 'cursor-move hover:border-primary' : ''
        } ${
          isDragOver ? 'ring-2 ring-primary scale-105' : ''
        } ${
          draggedMatch?.id === match.id ? 'opacity-50' : ''
        }`}
        draggable={isEditable}
        onDragStart={handleDragStart}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragEnd={handleDragEnd}
        onClick={(e) => {
          if (isEditable && !draggedMatch) {
            e.stopPropagation();
            handleEditClick(match);
          }
        }}
      >
        {isEditable && (
          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <div className="bg-primary text-primary-foreground rounded p-1 flex gap-1">
              <Icon name="GripVertical" size={12} />
              <Icon name="Edit" size={12} />
            </div>
          </div>
        )}
        <div className={`flex items-center justify-between p-2 border-b ${team1Won ? 'bg-green-500/10' : ''}`}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-xs text-muted-foreground">#{match.id}</span>
            <span className="text-sm font-medium truncate">{match.team1}</span>
          </div>
          {match.score1 !== undefined && (
            <span className={`text-sm font-bold ml-2 ${team1Won ? 'text-green-600' : ''}`}>
              {match.score1}
            </span>
          )}
        </div>
        <div className={`flex items-center justify-between p-2 ${team2Won ? 'bg-green-500/10' : ''}`}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-xs text-muted-foreground">#{match.id}</span>
            <span className="text-sm font-medium truncate">{match.team2}</span>
          </div>
          {match.score2 !== undefined && (
            <span className={`text-sm font-bold ml-2 ${team2Won ? 'text-green-600' : ''}`}>
              {match.score2}
            </span>
          )}
        </div>
      </div>
    );
  };

  const EmptySlot = ({ text }: { text: string }) => (
    <div className="bg-muted/30 border border-dashed rounded-lg p-2">
      <div className="text-xs text-muted-foreground text-center py-2">{text}</div>
    </div>
  );

  const RoundWithConnectors = ({ 
    round, 
    roundIdx, 
    isLastRound 
  }: { 
    round: BracketMatch[]; 
    roundIdx: number; 
    isLastRound: boolean;
  }) => {
    const matchHeight = 80;
    const baseGap = 24;
    
    // Расстояние между матчами в текущем раунде
    const spacing = roundIdx === 0 ? baseGap : baseGap + (matchHeight + baseGap) * (Math.pow(2, roundIdx) - 1);
    
    // Верхний отступ для выравнивания раунда
    const topOffset = roundIdx === 0 ? 0 : (matchHeight + baseGap) * (Math.pow(2, roundIdx - 1) - 1) / 2 + (matchHeight / 2) * (Math.pow(2, roundIdx - 1));

    return (
      <div className="flex items-start">
        <div 
          className="flex flex-col" 
          style={{ 
            minWidth: '200px',
            gap: `${spacing}px`,
            marginTop: `${topOffset}px`
          }}
        >
          <div className="text-center mb-2 -mt-8">
            <Badge variant="outline" className="text-xs">
              {isLastRound ? 'Финал' : `Раунд ${roundIdx + 1}`}
            </Badge>
          </div>
          {round.map((match) => (
            <div key={match.id} style={{ height: `${matchHeight}px` }}>
              <MatchBox match={match} />
            </div>
          ))}
        </div>

        {!isLastRound && (
          <div 
            className="relative" 
            style={{ 
              width: '48px',
              marginTop: `${topOffset}px`
            }}
          >
            {round.map((_, idx) => {
              if (idx % 2 === 0 && idx < round.length - 1) {
                // Позиция центра первого матча пары
                const firstMatchCenter = idx * (matchHeight + spacing) + matchHeight / 2;
                // Позиция центра второго матча пары
                const secondMatchCenter = (idx + 1) * (matchHeight + spacing) + matchHeight / 2;
                // Точка выхода - ровно посередине между двумя матчами
                const connectionPoint = (firstMatchCenter + secondMatchCenter) / 2;

                return (
                  <svg
                    key={idx}
                    className="absolute left-0 pointer-events-none"
                    style={{ 
                      top: `${firstMatchCenter}px`,
                      width: '48px',
                      height: `${secondMatchCenter - firstMatchCenter}px`
                    }}
                  >
                    <path
                      d={`M 0 0 L 16 0 L 16 ${(secondMatchCenter - firstMatchCenter) / 2} M 16 ${(secondMatchCenter - firstMatchCenter) / 2} L 48 ${(secondMatchCenter - firstMatchCenter) / 2} M 0 ${secondMatchCenter - firstMatchCenter} L 16 ${secondMatchCenter - firstMatchCenter} L 16 ${(secondMatchCenter - firstMatchCenter) / 2}`}
                      fill="none"
                      stroke="hsl(var(--border))"
                      strokeWidth="2"
                    />
                  </svg>
                );
              }
              return null;
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Dialog open={!!editingMatch} onOpenChange={() => setEditingMatch(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать матч #{editingMatch?.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{editingMatch?.team1}</label>
              <Input
                type="number"
                min="0"
                value={score1}
                onChange={(e) => setScore1(e.target.value)}
                placeholder="Счёт"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{editingMatch?.team2}</label>
              <Input
                type="number"
                min="0"
                value={score2}
                onChange={(e) => setScore2(e.target.value)}
                placeholder="Счёт"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">
                <Icon name="Save" size={16} className="mr-2" />
                Сохранить
              </Button>
              <Button variant="outline" onClick={() => setEditingMatch(null)} className="flex-1">
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-12">
      {upperMatches.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Badge className="bg-green-500">Верхняя сетка</Badge>
            <span className="text-sm text-muted-foreground">Winner Bracket</span>
          </div>
          
          <div className="overflow-x-auto pb-4 rounded-sm">
            <div className="inline-flex">
              {upperMatches.map((round, roundIdx) => (
                <RoundWithConnectors
                  key={roundIdx}
                  round={round}
                  roundIdx={roundIdx}
                  isLastRound={roundIdx === upperMatches.length - 1}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {lowerMatches.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Badge className="bg-orange-500">Нижняя сетка</Badge>
            <span className="text-sm text-muted-foreground">Loser Bracket</span>
          </div>
          
          <div className="overflow-x-auto pb-4">
            <div className="inline-flex">
              {lowerMatches.map((round, roundIdx) => (
                <RoundWithConnectors
                  key={roundIdx}
                  round={round}
                  roundIdx={roundIdx}
                  isLastRound={roundIdx === lowerMatches.length - 1}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {finals && (
        <div>
          <div className="mb-4 flex items-center gap-2 justify-center">
            <Badge className="bg-yellow-500">Гранд финал</Badge>
          </div>
          <div className="max-w-xs mx-auto">
            <MatchBox match={finals} isWinner />
          </div>
        </div>
      )}
    </div>
    </>
  );
}