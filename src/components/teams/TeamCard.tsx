import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Team {
  id: number;
  team_name: string;
  captain_name: string;
  captain_telegram: string;
  members_count: number;
  members_info: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_comment: string;
  created_at: string;
}

interface TeamCardProps {
  team: Team;
  isAdmin: boolean;
  formatMembersInfo: (membersInfo: string, showTelegram: boolean) => string[];
  onStatusChange: (teamId: number, newStatus: 'approved' | 'rejected') => void;
  onDeleteTeam: (teamId: number) => void;
  onEditTeam: (team: Team) => void;
}

export default function TeamCard({ team, isAdmin, formatMembersInfo, onStatusChange, onDeleteTeam, onEditTeam }: TeamCardProps) {
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="font-heading flex items-center gap-3">
              {team.team_name}
              <Badge variant={
                team.status === 'approved' ? 'default' : 
                team.status === 'rejected' ? 'destructive' : 'secondary'
              }>
                {team.status === 'approved' ? 'Одобрена' : 
                 team.status === 'rejected' ? 'Отклонена' : 'На модерации'}
              </Badge>
            </CardTitle>
            <CardDescription>
              Капитан: {team.captain_name} • Участников: {team.members_count}
            </CardDescription>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onEditTeam(team)}
              >
                <Icon name="Edit" size={16} />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => onDeleteTeam(team.id)}
              >
                <Icon name="Trash2" size={16} />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm">
          <span className="text-muted-foreground">Telegram:</span> {team.captain_telegram}
        </div>
        {team.members_info && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium mb-2">Состав команды:</p>
            <div className="space-y-1">
              {formatMembersInfo(team.members_info, true).map((member, idx) => (
                <p key={idx} className="text-sm text-muted-foreground">{member}</p>
              ))}
            </div>
          </div>
        )}
        {isAdmin && team.status === 'pending' && (
          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => onStatusChange(team.id, 'approved')}
              className="flex-1"
              variant="default"
            >
              <Icon name="CheckCircle" size={16} className="mr-2" />
              Одобрить
            </Button>
            <Button
              onClick={() => onStatusChange(team.id, 'rejected')}
              className="flex-1"
              variant="destructive"
            >
              <Icon name="XCircle" size={16} className="mr-2" />
              Отклонить
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
