import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface RulesSectionProps {
  onNavigateToContacts: () => void;
}

export default function RulesSection({ onNavigateToContacts }: RulesSectionProps) {
  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-3xl font-heading flex items-center gap-3">
            <Icon name="FileText" size={32} className="text-primary" />
            Правила регистрации
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold">1</span>
              </div>
              <div>
                <h3 className="font-heading font-semibold mb-2">Заполнение формы</h3>
                <p className="text-muted-foreground">Укажите достоверную информацию о команде и капитане. Все поля, отмеченные звездочкой (*), обязательны для заполнения.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold">2</span>
              </div>
              <div>
                <h3 className="font-heading font-semibold mb-2">Модерация заявки</h3>
                <p className="text-muted-foreground">После отправки заявка поступает в Telegram администраторов для проверки. Срок рассмотрения — до 3 рабочих дней.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold">3</span>
              </div>
              <div>
                <h3 className="font-heading font-semibold mb-2">Уведомление о результате</h3>
                <p className="text-muted-foreground">Решение по заявке будет отправлено в Telegram капитану команды.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold">4</span>
              </div>
              <div>
                <h3 className="font-heading font-semibold mb-2">Требования к команде</h3>
                <p className="text-muted-foreground">Количество участников в команде: от 5 до 7 человек.</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex gap-3">
              <Icon name="Info" size={20} className="text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm">
                При возникновении вопросов обращайтесь в раздел <button onClick={onNavigateToContacts} className="text-primary underline hover:no-underline">Контакты</button>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
