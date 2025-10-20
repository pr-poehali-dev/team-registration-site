# 🔒 API: Управление статусом регистрации

## Описание

Система контроля открытия/закрытия регистрации команд для турнира.

**Логика работы:**
- ✅ Регистрация ОТКРЫТА (`is_open = TRUE`) → капитаны могут редактировать и удалять команды
- 🔒 Регистрация ЗАКРЫТА (`is_open = FALSE`) → редактирование и удаление запрещены

---

## 📍 Endpoints

### 1. Получить статус регистрации

**GET** `/php-backend/api/registration-status.php`

**Ответ:**
```json
{
  "is_open": true,
  "updated_at": "2025-01-15 14:30:00",
  "updated_by": "admin"
}
```

**Использование в frontend:**
```javascript
const response = await fetch('https://ce876244.tw1.ru/php-backend/api/registration-status.php');
const data = await response.json();
console.log('Регистрация открыта:', data.is_open);
```

---

### 2. Изменить статус регистрации (Админ)

**POST** `/php-backend/api/teams.php`

**Тело запроса:**
```json
{
  "resource": "settings",
  "is_open": false,
  "updated_by": "admin"
}
```

**Ответ:**
```json
{
  "success": true,
  "is_open": false
}
```

**Использование в frontend:**
```javascript
const response = await fetch('https://ce876244.tw1.ru/php-backend/api/teams.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    resource: 'settings',
    is_open: false, // закрыть регистрацию
    updated_by: 'admin'
  })
});
```

---

### 3. Получить статус в списке команд

**GET** `/php-backend/api/teams.php?resource=settings`

**Ответ:**
```json
{
  "is_open": true
}
```

---

## 🛡️ Защита операций

### PUT (редактирование команды)

**Когда регистрация ЗАКРЫТА:**
```bash
curl -X PUT https://ce876244.tw1.ru/php-backend/api/teams.php \
  -H "Content-Type: application/json" \
  -d '{"id": 1, "team_name": "New Name"}'
```

**Ответ (403 Forbidden):**
```json
{
  "error": "Registration closed",
  "message": "Регистрация завершена. Редактирование команд больше не доступно."
}
```

---

### DELETE (удаление команды)

**Когда регистрация ЗАКРЫТА:**
```bash
curl -X DELETE https://ce876244.tw1.ru/php-backend/api/teams.php?id=1
```

**Ответ (403 Forbidden):**
```json
{
  "error": "Registration closed",
  "message": "Регистрация завершена. Удаление команд больше не доступно."
}
```

---

## 🎯 Примеры использования в React

### Проверка статуса при загрузке

```typescript
const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);

useEffect(() => {
  const loadStatus = async () => {
    try {
      const response = await fetch(
        'https://ce876244.tw1.ru/php-backend/api/registration-status.php'
      );
      const data = await response.json();
      setIsRegistrationOpen(data.is_open);
    } catch (error) {
      console.error('Failed to load registration status:', error);
    }
  };
  
  loadStatus();
}, []);
```

### Переключение статуса (Админ)

```typescript
const toggleRegistration = async () => {
  try {
    const response = await fetch('https://ce876244.tw1.ru/php-backend/api/teams.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resource: 'settings',
        is_open: !isRegistrationOpen,
        updated_by: 'admin'
      })
    });
    
    if (response.ok) {
      setIsRegistrationOpen(!isRegistrationOpen);
      toast({
        title: isRegistrationOpen ? "Регистрация закрыта" : "Регистрация открыта"
      });
    }
  } catch (error) {
    console.error('Failed to toggle registration:', error);
  }
};
```

### Блокировка редактирования

```typescript
const handleEditTeam = () => {
  if (!isRegistrationOpen) {
    toast({
      title: "Редактирование недоступно",
      description: "Регистрация завершена. Изменение команд больше не доступно.",
      variant: "destructive"
    });
    return;
  }
  
  // Показать форму редактирования
  setIsEditDialogOpen(true);
};
```

### Показ плашки "Регистрация завершена"

```typescript
{!isRegistrationOpen && (
  <Card className="border-orange-500/50 bg-orange-500/10">
    <CardContent className="pt-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="text-orange-500" />
        <div>
          <h3 className="font-semibold text-orange-500">Регистрация завершена</h3>
          <p className="text-sm text-muted-foreground">
            Период регистрации закрыт. Редактирование и отмена регистрации команд больше не доступны.
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
)}
```

---

## 📊 База данных

### Структура таблицы `registration_settings`

```sql
CREATE TABLE IF NOT EXISTS registration_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    is_open BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by VARCHAR(255)
);
```

### Дефолтное значение

Если в таблице нет записей, API автоматически создаст запись с `is_open = TRUE`.

---

## ✅ Проверка работы

### Тест 1: Получить статус
```bash
curl https://ce876244.tw1.ru/php-backend/api/registration-status.php
```

**Ожидаемый результат:**
```json
{"is_open":true,"updated_at":"2025-01-15 14:30:00","updated_by":"admin"}
```

### Тест 2: Закрыть регистрацию
```bash
curl -X POST https://ce876244.tw1.ru/php-backend/api/teams.php \
  -H "Content-Type: application/json" \
  -d '{"resource":"settings","is_open":false,"updated_by":"admin"}'
```

**Ожидаемый результат:**
```json
{"success":true,"is_open":false}
```

### Тест 3: Попытка редактирования (должна провалиться)
```bash
curl -X PUT https://ce876244.tw1.ru/php-backend/api/teams.php \
  -H "Content-Type: application/json" \
  -d '{"id":1,"team_name":"New Name"}'
```

**Ожидаемый результат (403):**
```json
{"error":"Registration closed","message":"Регистрация завершена. Редактирование команд больше не доступно."}
```

### Тест 4: Открыть регистрацию обратно
```bash
curl -X POST https://ce876244.tw1.ru/php-backend/api/teams.php \
  -H "Content-Type: application/json" \
  -d '{"resource":"settings","is_open":true,"updated_by":"admin"}'
```

**Ожидаемый результат:**
```json
{"success":true,"is_open":true}
```

---

## 🔑 Важные моменты

### ✅ Что работает

1. **Админ всегда может модерировать заявки** (approve/reject) - даже когда регистрация закрыта
2. **Статус регистрации проверяется автоматически** перед редактированием и удалением
3. **Frontend показывает плашку** когда регистрация закрыта
4. **Кнопки редактирования/удаления блокируются** на стороне клиента
5. **API дополнительно проверяет** на сервере (защита от обхода)

### ❌ Что запрещено при закрытой регистрации

1. Капитаны **не могут** редактировать состав команды
2. Капитаны **не могут** изменить название команды
3. Капитаны **не могут** удалить команду
4. API вернёт **403 Forbidden** при попытке

### ⚠️ Исключения

- **Админ может модерировать заявки** (approve/reject) в любое время
- **Админ может менять статус регистрации** в любое время
- **Админ может удалять команды** через админ-панель

---

## 📝 Changelog

**v1.0 (2025-01-15)**
- ✅ Добавлен endpoint `/registration-status.php`
- ✅ Добавлена проверка в PUT метод `teams.php`
- ✅ Добавлена проверка в DELETE метод `teams.php`
- ✅ Улучшена обработка настроек в POST методе
- ✅ Frontend показывает плашку при закрытой регистрации
- ✅ Frontend блокирует редактирование и удаление

---

## 🆘 Troubleshooting

### Проблема: API всегда возвращает `is_open: true`

**Решение:** Проверь что в таблице `registration_settings` есть запись:
```sql
SELECT * FROM registration_settings;
```

Если записи нет, создай:
```sql
INSERT INTO registration_settings (is_open, updated_by) VALUES (FALSE, 'admin');
```

### Проблема: Frontend не блокирует редактирование

**Решение:** Проверь что статус загружается в компоненте:
```typescript
useEffect(() => {
  loadRegistrationStatus();
}, []);
```

### Проблема: Капитаны всё ещё могут редактировать

**Решение:** Проверь версию `teams.php` - должна быть проверка:
```php
if (!$settings || !$settings['is_open']) {
    http_response_code(403);
    // ...
}
```

---

**Разработано для:** Tournament System v1.0  
**Платформа:** Timeweb Hosting + React Frontend
