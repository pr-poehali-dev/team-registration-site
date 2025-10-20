import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export default function ContactsSection() {
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-3xl font-heading flex items-center gap-3">
            <Icon name="Mail" size={32} className="text-primary" />
            Контакты
          </CardTitle>
          <CardDescription>Свяжитесь с нами по любым вопросам</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:border-primary/40 transition-all">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Icon name="Mail" size={24} className="text-primary" />
              </div>
              <div>
                <p className="font-medium">Email</p>
                <p className="text-muted-foreground">info@teamreg.example.com</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:border-primary/40 transition-all">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Icon name="Phone" size={24} className="text-primary" />
              </div>
              <div>
                <p className="font-medium">Телефон</p>
                <p className="text-muted-foreground">+7 (999) 123-45-67</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:border-primary/40 transition-all">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Icon name="MessageCircle" size={24} className="text-primary" />
              </div>
              <div>
                <p className="font-medium">Telegram</p>
                <p className="text-muted-foreground">@teamreg_support</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:border-primary/40 transition-all">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Icon name="Clock" size={24} className="text-primary" />
              </div>
              <div>
                <p className="font-medium">Время работы</p>
                <p className="text-muted-foreground">Пн-Пт: 9:00 - 18:00 (МСК)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
