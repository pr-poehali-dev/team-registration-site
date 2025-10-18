import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

interface TeamsSectionProps {
  teams: Team[];
  isAdmin: boolean;
  onLoadTeams: () => void;
  onStatusChange: (teamId: number, newStatus: 'approved' | 'rejected') => void;
}

export default function TeamsSection({ teams, isAdmin, onLoadTeams, onStatusChange }: TeamsSectionProps) {
  const approvedTeams = teams.filter(team => team.status === 'approved');
  const pendingTeams = teams.filter(team => team.status === 'pending');
  const rejectedTeams = teams.filter(team => team.status === 'rejected');

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-heading font-bold">Зарегистрированные команды</h2>
        <Button onClick={onLoadTeams} variant="outline">
          <Icon name="RefreshCw" size={18} className="mr-2" />
          Обновить
        </Button>
      </div>

      {isAdmin && (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="all">Все</TabsTrigger>
            <TabsTrigger value="pending">Ожидают</TabsTrigger>
            <TabsTrigger value="approved">Одобрены</TabsTrigger>
            <TabsTrigger value="rejected">Отклонены</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            {teams.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Icon name="Inbox" size={48} className="text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Нет зарегистрированных команд</p>
                </CardContent>
              </Card>
            ) : (
              teams.map((team) => (
                <Card key={team.id} className="border-primary/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="font-heading flex items-center gap-3">
                          {team.team_name}
                          <Badge variant={
                            team.status === 'approved' ? 'default' : 
                            team.status === 'rejected' ? 'destructive' : 'secondary'
                          }>
                            {team.status === 'pending' && 'На модерации'}
                            {team.status === 'approved' && 'Одобрена'}
                            {team.status === 'rejected' && 'Отклонена'}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          Капитан: {team.captain_name} • Участников: {team.members_count}
                        </CardDescription>
                      </div>
                      {isAdmin && team.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => onStatusChange(team.id, 'approved')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Icon name="Check" size={16} className="mr-1" />
                            Одобрить
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => onStatusChange(team.id, 'rejected')}
                          >
                            <Icon name="X" size={16} className="mr-1" />
                            Отклонить
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
                        <p className="text-sm text-muted-foreground whitespace-pre-line">{team.members_info}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4 mt-6">
            {pendingTeams.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Icon name="Clock" size={48} className="text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Нет команд на модерации</p>
                </CardContent>
              </Card>
            ) : (
              pendingTeams.map((team) => (
                <Card key={team.id} className="border-primary/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="font-heading flex items-center gap-3">
                          {team.team_name}
                          <Badge variant="secondary">На модерации</Badge>
                        </CardTitle>
                        <CardDescription>
                          Капитан: {team.captain_name} • Участников: {team.members_count}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => onStatusChange(team.id, 'approved')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Icon name="Check" size={16} className="mr-1" />
                          Одобрить
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => onStatusChange(team.id, 'rejected')}
                        >
                          <Icon name="X" size={16} className="mr-1" />
                          Отклонить
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Telegram:</span> {team.captain_telegram}
                    </div>
                    {team.members_info && (
                      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm font-medium mb-2">Состав команды:</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">{team.members_info}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4 mt-6">
            {approvedTeams.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Icon name="CheckCircle" size={48} className="text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Нет одобренных команд</p>
                </CardContent>
              </Card>
            ) : (
              approvedTeams.map((team) => (
                <Card key={team.id} className="border-primary/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="font-heading flex items-center gap-3">
                          {team.team_name}
                          <Badge>Одобрена</Badge>
                        </CardTitle>
                        <CardDescription>
                          Капитан: {team.captain_name} • Участников: {team.members_count}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Telegram:</span> {team.captain_telegram}
                    </div>
                    {team.members_info && (
                      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm font-medium mb-2">Состав команды:</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">{team.members_info}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4 mt-6">
            {rejectedTeams.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Icon name="XCircle" size={48} className="text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Нет отклоненных команд</p>
                </CardContent>
              </Card>
            ) : (
              rejectedTeams.map((team) => (
                <Card key={team.id} className="border-destructive/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="font-heading flex items-center gap-3">
                          {team.team_name}
                          <Badge variant="destructive">Отклонена</Badge>
                        </CardTitle>
                        <CardDescription>
                          Капитан: {team.captain_name} • Участников: {team.members_count}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Telegram:</span> {team.captain_telegram}
                    </div>
                    {team.members_info && (
                      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm font-medium mb-2">Состав команды:</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">{team.members_info}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      )}

      {!isAdmin && (
        <div className="space-y-4">
          {approvedTeams.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Icon name="Users" size={48} className="text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Пока нет одобренных команд</p>
              </CardContent>
            </Card>
          ) : (
            approvedTeams.map((team) => (
              <Card key={team.id} className="border-primary/20">
                <CardHeader>
                  <div>
                    <CardTitle className="font-heading flex items-center gap-3">
                      {team.team_name}
                      <Badge>Участвует</Badge>
                    </CardTitle>
                    <CardDescription>
                      Капитан: {team.captain_name} • Участников: {team.members_count}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Telegram:</span> {team.captain_telegram}
                  </div>
                  {team.members_info && (
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium mb-2">Состав команды:</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">{team.members_info}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}