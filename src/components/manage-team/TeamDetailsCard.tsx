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
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="font-heading">{team.team_name}</CardTitle>
            <CardDescription>
              Капитан: {team.captain_name} • Статус: {
                team.status === 'pending' ? 'На модерации' :
                team.status === 'approved' ? 'Одобрена' : 'Отклонена'
              }
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={onEdit}
              disabled={!isRegistrationOpen}
            >
              <Icon name="Edit" size={16} className="mr-1" />
              Редактировать
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={onCancel}
              disabled={!isRegistrationOpen}
            >
              <Icon name="Trash2" size={16} className="mr-1" />
              Отменить регистрацию
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm mb-4">
          <span className="text-muted-foreground">Telegram капитана:</span> {team.captain_telegram}
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
