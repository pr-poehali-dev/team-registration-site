import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export default function RegistrationClosedAlert() {
  return (
    <Card className="border-orange-500/50 bg-orange-500/10">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <Icon name="AlertCircle" size={24} className="text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-orange-500 mb-1">Регистрация завершена</h3>
            <p className="text-sm text-muted-foreground">
              Период регистрации закрыт. Редактирование и отмена регистрации команд больше не доступны.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
