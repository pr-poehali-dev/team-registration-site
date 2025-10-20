import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface TeamSearchCardProps {
  captainTelegram: string;
  isLoading: boolean;
  onCaptainTelegramChange: (value: string) => void;
  onSearch: () => void;
}

export default function TeamSearchCard({
  captainTelegram,
  isLoading,
  onCaptainTelegramChange,
  onSearch
}: TeamSearchCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Найти мою команду</CardTitle>
        <CardDescription>Введите код регистрации, полученный в боте</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="REG-XXXX-XXXX"
              value={captainTelegram}
              onChange={(e) => onCaptainTelegramChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
              className="font-mono uppercase"
            />
          </div>
          <Button onClick={onSearch} disabled={isLoading}>
            <Icon name="Search" size={16} className="mr-2" />
            {isLoading ? 'Поиск...' : 'Найти'}
          </Button>
        </div>
        <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
          <p>
            💡 Код регистрации отправляется ботом после успешной регистрации команды. 
            Формат: REG-XXXX-XXXX
          </p>
        </div>
      </CardContent>
    </Card>
  );
}