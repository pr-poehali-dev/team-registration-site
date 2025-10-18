import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export default function ScheduleSection() {
  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-3xl font-heading flex items-center gap-3">
            <Icon name="Calendar" size={32} className="text-primary" />
            Сетка мероприятия
          </CardTitle>
          <CardDescription>Расписание игр и турнирная таблица</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Icon name="CalendarClock" size={64} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground mb-2">Сетка появится после завершения регистрации</p>
            <p className="text-sm text-muted-foreground">Здесь будет отображаться расписание игр и результаты</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
