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
        <CardDescription>Введите Telegram, который вы указали при регистрации</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="@username"
              value={captainTelegram}
              onChange={(e) => onCaptainTelegramChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            />
          </div>
          <Button onClick={onSearch} disabled={isLoading}>
            <Icon name="Search" size={16} className="mr-2" />
            {isLoading ? 'Поиск...' : 'Найти'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
