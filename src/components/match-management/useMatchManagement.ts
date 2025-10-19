import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import funcUrls from '../../../backend/func2url.json';
import { Match, Team } from './types';

const API_URL = funcUrls.teams;

export function useMatchManagement(adminToken: string = '') {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportingTeams, setExportingTeams] = useState(false);
  const [showBulkCreate, setShowBulkCreate] = useState(false);
  const [bulkTeamNames, setBulkTeamNames] = useState('');
  const [creatingTeams, setCreatingTeams] = useState(false);
  const [generatingBracket, setGeneratingBracket] = useState(false);
  const [clearingBracket, setClearingBracket] = useState(false);
  const [shufflingTeams, setShufflingTeams] = useState(false);
  const [clearingTeams, setClearingTeams] = useState(false);

  const { toast } = useToast();

  const loadMatches = async () => {
    try {
      const response = await fetch(`${API_URL}?resource=matches`);
      const data = await response.json();
      if (data.success) {
        setMatches(data.matches);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить матчи',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTeams = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setTeams(data.teams || []);
    } catch (error) {
      console.error('Failed to load teams:', error);
      setTeams([]);
    }
  };

  useEffect(() => {
    loadMatches();
    loadTeams();
  }, []);

  const handleExportTeams = async () => {
    setExportingTeams(true);
    try {
      const response = await fetch(`${API_URL}?resource=export`);
      const data = await response.json();
      
      if (data.success) {
        const csvContent = data.csv;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `teams_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: 'Успешно',
          description: `Экспортировано команд: ${data.total}`,
        });
      } else {
        toast({
          title: 'Ошибка',
          description: data.message || 'Не удалось экспортировать команды',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Проблема с подключением к серверу',
        variant: 'destructive',
      });
    } finally {
      setExportingTeams(false);
    }
  };

  const handleBulkCreate = async () => {
    const teamNames = bulkTeamNames
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0);

    if (teamNames.length === 0) {
      toast({
        title: 'Ошибка',
        description: 'Введите хотя бы одно название команды',
        variant: 'destructive',
      });
      return;
    }

    setCreatingTeams(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken,
        },
        body: JSON.stringify({
          resource: 'bulk_create',
          team_names: teamNames,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Успешно',
          description: `Создано команд: ${data.created}`,
        });
        loadTeams();
        setBulkTeamNames('');
        setShowBulkCreate(false);
      } else {
        toast({
          title: 'Ошибка',
          description: data.message || 'Не удалось создать команды',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Проблема с подключением к серверу',
        variant: 'destructive',
      });
    } finally {
      setCreatingTeams(false);
    }
  };

  const handleGenerateBracket = async () => {
    setGeneratingBracket(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken,
        },
        body: JSON.stringify({
          resource: 'generate_bracket',
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Успешно',
          description: `Создано матчей: ${data.matches_created}`,
        });
        loadMatches();
      } else {
        toast({
          title: 'Ошибка',
          description: data.message || 'Не удалось создать сетку',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Проблема с подключением к серверу',
        variant: 'destructive',
      });
    } finally {
      setGeneratingBracket(false);
    }
  };

  const handleClearBracket = async () => {
    if (!confirm('Вы уверены? Это удалит все матчи из турнирной сетки.')) {
      return;
    }

    setClearingBracket(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken,
        },
        body: JSON.stringify({
          resource: 'clear_bracket',
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Успешно',
          description: 'Турнирная сетка очищена',
        });
        loadMatches();
      } else {
        toast({
          title: 'Ошибка',
          description: data.message || 'Не удалось очистить сетку',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Проблема с подключением к серверу',
        variant: 'destructive',
      });
    } finally {
      setClearingBracket(false);
    }
  };

  const handleShuffleTeams = async () => {
    if (!confirm('Это перемешает порядок команд и создаст новую сетку. Продолжить?')) {
      return;
    }

    setShufflingTeams(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken,
        },
        body: JSON.stringify({
          resource: 'shuffle_and_generate',
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Успешно',
          description: `Команды перемешаны. Создано матчей: ${data.matches_created}`,
        });
        loadMatches();
      } else {
        toast({
          title: 'Ошибка',
          description: data.message || 'Не удалось перемешать команды',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Проблема с подключением к серверу',
        variant: 'destructive',
      });
    } finally {
      setShufflingTeams(false);
    }
  };

  const handleClearAllTeams = async () => {
    setClearingTeams(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken,
        },
        body: JSON.stringify({
          resource: 'clear_teams',
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Успешно',
          description: data.message,
        });
        loadMatches();
        loadTeams();
      } else {
        toast({
          title: 'Ошибка',
          description: data.message || 'Не удалось очистить команды',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Проблема с подключением к серверу',
        variant: 'destructive',
      });
    } finally {
      setClearingTeams(false);
    }
  };



  const handleUpdateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch) return;

    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken,
        },
        body: JSON.stringify({
          resource: 'match',
          match_id: selectedMatch.id,
          team1_id: selectedMatch.team1_id,
          team2_id: selectedMatch.team2_id,
          team1_placeholder: selectedMatch.team1_placeholder,
          team2_placeholder: selectedMatch.team2_placeholder,
          score1: selectedMatch.score1,
          score2: selectedMatch.score2,
          winner: selectedMatch.winner,
          status: selectedMatch.status,
          scheduled_time: selectedMatch.scheduled_time,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Успешно',
          description: 'Матч обновлён',
        });
        loadMatches();
        setSelectedMatch(null);
      } else {
        toast({
          title: 'Ошибка',
          description: data.message || 'Не удалось обновить матч',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Проблема с подключением к серверу',
        variant: 'destructive',
      });
    }
  };

  return {
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
  };
}