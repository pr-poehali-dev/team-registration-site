import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  auth_code?: string;
}

interface TeamDetailsCardProps {
  team: Team;
  isRegistrationOpen: boolean;
  onEdit: () => void;
  onCancel: () => void;
}

const formatMembersInfo = (membersInfo: string): string[] => {
  if (!membersInfo) return [];
  return membersInfo.split('\n').filter(line => line.trim()).map(line => line.trim());
};

export default function TeamDetailsCard({
  team,
  isRegistrationOpen,
  onEdit,
  onCancel
}: TeamDetailsCardProps) {
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="font-heading text-xl sm:text-2xl">{team.team_name}</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Капитан: {team.captain_name} • Статус: {
                team.status === 'pending' ? 'На модерации' :
                team.status === 'approved' ? 'Одобрена' : 'Отклонена'
              }
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button 
              size="sm" 
              onClick={onEdit}
              disabled={!isRegistrationOpen}
              className="w-full sm:w-auto"
            >
              <Icon name="Edit" size={16} className="mr-1" />
              Редактировать
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={onCancel}
              disabled={!isRegistrationOpen}
              className="w-full sm:w-auto"
            >
              <Icon name="Trash2" size={16} className="mr-1" />
              Отменить регистрацию
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="text-sm">
            <span className="text-muted-foreground">Telegram капитана:</span>
            <p className="font-medium">{team.captain_telegram}</p>
          </div>
          {team.auth_code && (
            <div className="text-sm">
              <span className="text-muted-foreground">Код регистрации:</span>
              <p className="font-mono font-bold text-lg text-primary">{team.auth_code}</p>
            </div>
          )}
        </div>
        {team.members_info && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium mb-2">Состав команды:</p>
            <div className="space-y-1">
              {formatMembersInfo(team.members_info).map((member, idx) => (
                <p key={idx} className="text-sm text-muted-foreground">{member}</p>
              ))}
            </div>
          </div>
        )}
        {team.admin_comment && (
          <div className="mt-4 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
            <p className="text-sm font-medium mb-1">Комментарий администратора:</p>
            <p className="text-sm text-muted-foreground">{team.admin_comment}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}