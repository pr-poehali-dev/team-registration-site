import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import funcUrls from '../../backend/func2url.json';

const SETUP_URL = funcUrls['setup-bot'];

interface BotInfo {
  success: boolean;
  message: string;
  bot_username?: string;
  webhook_url?: string;
  bot_link?: string;
  webhook_info?: {
    url: string;
    has_custom_certificate: boolean;
    pending_update_count: number;
  };
  error?: string;
}

export default function BotSetup() {
  const [loading, setLoading] = useState(false);
  const [botInfo, setBotInfo] = useState<BotInfo | null>(null);
  const { toast } = useToast();

  const setupBot = async () => {
    // Открыть страницу настройки webhook
    window.open('https://ce876244.tw1.ru/setup-telegram-webhook.php', '_blank');
    
    setBotInfo({
      success: true,
      message: "Откройте страницу настройки webhook в новой вкладке",
      bot_username: "ваш_бот",
      bot_link: "https://t.me/ваш_бот"
    });
    
    toast({
      title: "Инструкция открыта",
      description: "Следуйте инструкциям на странице настройки",
    });
  };

  const stopBot = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${SETUP_URL}?action=stop`);
      const data = await response.json();
      setBotInfo(data);
      
      if (data.success) {
        toast({
          title: "Бот остановлен!",
          description: "Telegram бот больше не принимает команды",
        });
      } else {
        toast({
          title: "Ошибка",
          description: data.error || "Не удалось остановить бота",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось подключиться к серверу",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          className="mb-6 text-white"
          onClick={() => window.location.href = '/'}
        >
          <Icon name="ArrowLeft" className="mr-2 h-4 w-4" />
          Назад
        </Button>

        <Card className="backdrop-blur-sm bg-white/10 border-white/20">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Icon name="Bot" className="h-8 w-8 text-purple-400" />
              <CardTitle className="text-3xl font-bold text-white">
                Настройка Telegram Бота
              </CardTitle>
            </div>
            <CardDescription className="text-gray-300 text-lg">
              Автоматическая настройка бота для регистрации команд
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={setupBot}
                disabled={loading}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-6 text-lg"
              >
                {loading ? (
                  <>
                    <Icon name="Loader2" className="mr-2 h-5 w-5 animate-spin" />
                    Настройка...
                  </>
                ) : (
                  <>
                    <Icon name="Play" className="mr-2 h-5 w-5" />
                    Запустить
                  </>
                )}
              </Button>

              <Button
                onClick={stopBot}
                disabled={loading}
                className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold py-6 text-lg"
              >
                {loading ? (
                  <>
                    <Icon name="Loader2" className="mr-2 h-5 w-5 animate-spin" />
                    Остановка...
                  </>
                ) : (
                  <>
                    <Icon name="Square" className="mr-2 h-5 w-5" />
                    Остановить
                  </>
                )}
              </Button>
            </div>

            {botInfo && (
              <div className="mt-6">
                {botInfo.success ? (
                  <Alert className="bg-green-500/20 border-green-400/50">
                    <Icon name="CheckCircle" className="h-4 w-4 text-green-400" />
                    <AlertDescription className="text-gray-200 ml-2">
                      <div className="space-y-2">
                        <p className="font-semibold">{botInfo.message}</p>
                        {botInfo.bot_username && (
                          <div>
                            <p className="text-sm">Username бота: @{botInfo.bot_username}</p>
                            <a 
                              href={botInfo.bot_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-300 hover:text-blue-200 underline flex items-center gap-1 mt-1"
                            >
                              Открыть бота
                              <Icon name="ExternalLink" className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                        {botInfo.webhook_info && (
                          <div className="text-sm text-gray-300 mt-2 pt-2 border-t border-green-400/30">
                            <p>Webhook: {botInfo.webhook_info.url ? '✓ активен' : '✗ не настроен'}</p>
                            <p>Ожидающих обновлений: {botInfo.webhook_info.pending_update_count}</p>
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="bg-red-500/20 border-red-400/50">
                    <Icon name="AlertCircle" className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-gray-200 ml-2">
                      <p className="font-semibold">Ошибка настройки</p>
                      <p className="text-sm mt-1">{botInfo.error}</p>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Icon name="MessageCircle" className="h-5 w-5 text-purple-400" />
                Команды бота
              </h3>
              <div className="grid gap-3 text-gray-200">
                <div className="bg-slate-800/50 rounded p-3">
                  <code className="text-purple-300 font-semibold">/start</code>
                  <p className="text-sm text-gray-400 mt-1">Приветствие и список команд</p>
                </div>
                <div className="bg-slate-800/50 rounded p-3">
                  <code className="text-purple-300 font-semibold">/register</code>
                  <p className="text-sm text-gray-400 mt-1">Начать регистрацию команды</p>
                </div>
                <div className="bg-slate-800/50 rounded p-3">
                  <code className="text-purple-300 font-semibold">/myteam</code>
                  <p className="text-sm text-gray-400 mt-1">Информация о зарегистрированной команде</p>
                </div>
                <div className="bg-slate-800/50 rounded p-3">
                  <code className="text-purple-300 font-semibold">/cancel</code>
                  <p className="text-sm text-gray-400 mt-1">Отменить регистрацию команды</p>
                </div>
                <div className="bg-slate-800/50 rounded p-3">
                  <code className="text-purple-300 font-semibold">/help</code>
                  <p className="text-sm text-gray-400 mt-1">Справка по командам</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}