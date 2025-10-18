import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

interface PublicTeamCardProps {
  team: Team;
  formatMembersInfo: (membersInfo: string, showTelegram: boolean) => string[];
}

export default function PublicTeamCard({ team, formatMembersInfo }: PublicTeamCardProps) {
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="font-heading flex items-center gap-3">
              {team.team_name}
              <Badge>Одобрена</Badge>
            </CardTitle>
            <CardDescription>
              Участников: {team.members_count}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {team.members_info && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium mb-2">Состав команды:</p>
            <div className="space-y-1">
              {formatMembersInfo(team.members_info, false).map((member, idx) => (
                <p key={idx} className="text-sm text-muted-foreground">{member}</p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
