import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const AUTH_URL = 'https://functions.poehali.dev/42990373-2c80-4ba8-b687-990125f12576';

interface Admin {
  id: number;
  username: string;
  telegram_id: string | null;
  created_at: string;
  last_login: string | null;
  is_active: boolean;
}

interface AdminManagementProps {
  currentUsername: string;
}

export default function AdminManagement({ currentUsername }: AdminManagementProps) {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null);
  const { toast } = useToast();

  const loadAdmins = async () => {
    try {
      const response = await fetch(AUTH_URL, {
        method: 'GET',
        headers: {
          'X-Admin-Username': currentUsername,
        },
      });

      const data = await response.json();

      if (data.success) {
        setAdmins(data.admins);
      } else {
        toast({
          title: 'Ошибка',
          description: data.message || 'Не удалось загрузить список админов',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Проблема с подключением к серверу',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleDeleteClick = (admin: Admin) => {
    setAdminToDelete(admin);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!adminToDelete) return;

    try {
      const response = await fetch(AUTH_URL, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Username': currentUsername,
        },
        body: JSON.stringify({ admin_id: adminToDelete.id }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Успешно',
          description: 'Администратор удалён',
        });
        loadAdmins();
      } else {
        toast({
          title: 'Ошибка',
          description: data.message || 'Не удалось удалить администратора',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Проблема с подключением к серверу',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setAdminToDelete(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="Loader2" size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Icon name="Users" size={24} className="text-primary" />
            <CardTitle>Управление администраторами</CardTitle>
          </div>
          <CardDescription>
            Список всех администраторов системы. Только вы можете управлять этим списком.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-sm font-medium mb-2 flex items-center gap-2">
              <Icon name="Info" size={16} />
              Как добавить нового администратора?
            </p>
            <p className="text-xs text-muted-foreground mb-2">
              Новые администраторы могут зарегистрироваться самостоятельно через Telegram бота:
            </p>
            <code className="block p-2 bg-background rounded text-xs">
              /adminlogin username password
            </code>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Логин</TableHead>
                  <TableHead className="whitespace-nowrap hidden sm:table-cell">Telegram</TableHead>
                  <TableHead className="whitespace-nowrap hidden md:table-cell">Создан</TableHead>
                  <TableHead className="whitespace-nowrap hidden md:table-cell">Последний вход</TableHead>
                  <TableHead className="whitespace-nowrap">Статус</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Нет администраторов
                    </TableCell>
                  </TableRow>
                ) : (
                  admins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                          <span className="text-sm">{admin.username}</span>
                          {admin.username === '@Rywrxuna' && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded w-fit">
                              Суперадмин
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">{admin.telegram_id || '—'}</TableCell>
                      <TableCell className="hidden md:table-cell text-xs sm:text-sm text-muted-foreground">
                        {formatDate(admin.created_at)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs sm:text-sm text-muted-foreground">
                        {formatDate(admin.last_login)}
                      </TableCell>
                      <TableCell>
                        {admin.is_active ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600">
                            <Icon name="CheckCircle" size={14} />
                            <span className="hidden sm:inline">Активен</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Icon name="XCircle" size={14} />
                            <span className="hidden sm:inline">Неактивен</span>
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {admin.username === '@Rywrxuna' ? (
                          <span className="text-xs text-muted-foreground">
                            Нельзя удалить
                          </span>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(admin)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить администратора?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить администратора{' '}
              <span className="font-semibold">{adminToDelete?.username}</span>? Это действие
              нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}