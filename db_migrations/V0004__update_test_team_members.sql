-- Обновление тестовых данных для команд с пустым составом

UPDATE teams 
SET members_info = 'Топ: TestPlayer1 - Телеграм: @testplayer1
Лес: TestPlayer2 - Телеграм: @testplayer2
Мид: TestPlayer3 - Телеграм: @testplayer3
АДК: TestPlayer4 - Телеграм: @testplayer4
Саппорт: TestPlayer5 - Телеграм: @testplayer5'
WHERE id = 7;

UPDATE teams 
SET members_info = 'Топ: DemoPlayer1 - Телеграм: @demoplayer1
Лес: DemoPlayer2 - Телеграм: @demoplayer2
Мид: DemoPlayer3 - Телеграм: @demoplayer3
АДК: DemoPlayer4 - Телеграм: @demoplayer4
Саппорт: DemoPlayer5 - Телеграм: @demoplayer5'
WHERE id = 8;