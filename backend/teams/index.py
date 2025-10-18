import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any
import urllib.request

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для управления заявками команд - создание, получение списка, обновление статуса
    Args: event с httpMethod, body, queryStringParameters; context с request_id
    Returns: HTTP response с списком команд или результатом операции
    '''
    method: str = event.get('httpMethod', 'GET')
    
    # Handle CORS OPTIONS
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    db_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(db_url)
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters', {}) or {}
            resource = params.get('resource')
            captain_telegram = params.get('captain_telegram')
            
            # Экспорт команд в CSV
            if resource == 'export':
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("""
                        SELECT team_name, captain_name, captain_telegram, 
                               members_info, status, created_at::text
                        FROM t_p68536388_team_registration_si.teams 
                        ORDER BY created_at DESC
                    """)
                    teams = cur.fetchall()
                
                csv_lines = ['Team Name,Captain Name,Captain Telegram,Status,Created At,Members Info']
                
                for team in teams:
                    members_clean = team['members_info'].replace('\n', ' | ').replace(',', ';')
                    csv_lines.append(
                        f'"{team["team_name"]}","{team["captain_name"]}","{team["captain_telegram"]}",'
                        f'"{team["status"]}","{team["created_at"]}","{members_clean}"'
                    )
                
                csv_content = '\n'.join(csv_lines)
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': True,
                        'csv': csv_content,
                        'total': len(teams)
                    }),
                    'isBase64Encoded': False
                }
            
            # Управление матчами
            if resource == 'matches':
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("""
                        SELECT 
                            m.id, m.match_number, m.bracket_type, m.round_number,
                            m.team1_id, m.team2_id, m.team1_placeholder, m.team2_placeholder,
                            m.score1, m.score2, m.winner, m.status, m.scheduled_time,
                            t1.team_name as team1_name, t2.team_name as team2_name
                        FROM t_p68536388_team_registration_si.matches m
                        LEFT JOIN t_p68536388_team_registration_si.teams t1 ON m.team1_id = t1.id
                        LEFT JOIN t_p68536388_team_registration_si.teams t2 ON m.team2_id = t2.id
                        ORDER BY m.bracket_type, m.round_number, m.match_number
                    """)
                    matches = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': True,
                        'matches': [dict(match) for match in matches]
                    }, default=str),
                    'isBase64Encoded': False
                }
            
            if captain_telegram:
                # Найти команду по Telegram капитана
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("""
                        SELECT id, team_name, captain_name, captain_telegram, 
                               members_count, members_info, status, admin_comment, 
                               created_at::text
                        FROM t_p68536388_team_registration_si.teams 
                        WHERE captain_telegram = %s
                    """, (captain_telegram,))
                    team = cur.fetchone()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'team': team}),
                    'isBase64Encoded': False
                }
            else:
                # Получить список всех команд
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("""
                        SELECT id, team_name, captain_name, captain_telegram, 
                               members_count, members_info, status, admin_comment, 
                               created_at::text
                        FROM t_p68536388_team_registration_si.teams 
                        ORDER BY created_at DESC
                    """)
                    teams = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'teams': teams}),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            resource = body_data.get('resource')
            
            # Импорт списка команд
            if resource == 'import_teams_list':
                teams_list = body_data.get('teams', [])
                
                if not teams_list or len(teams_list) < 2:
                    return {
                        'statusCode': 400,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({
                            'success': False,
                            'message': f'Нужно минимум 2 команды. Получено: {len(teams_list)}'
                        }),
                        'isBase64Encoded': False
                    }
                
                teams_imported = 0
                
                with conn.cursor() as cur:
                    for team_name in teams_list:
                        team_name = team_name.strip()
                        if not team_name:
                            continue
                        
                        cur.execute("""
                            SELECT id FROM t_p68536388_team_registration_si.teams 
                            WHERE team_name = %s
                        """, (team_name,))
                        existing = cur.fetchone()
                        
                        if not existing:
                            cur.execute("""
                                INSERT INTO t_p68536388_team_registration_si.teams 
                                (team_name, captain_name, captain_telegram, members_count, members_info, status)
                                VALUES (%s, %s, %s, %s, %s, %s)
                            """, (team_name, 'Импорт', '@imported', 1, 'Импортировано из списка', 'approved'))
                            teams_imported += 1
                    
                    conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': True,
                        'teams_imported': teams_imported,
                        'message': f'Импортировано: {teams_imported} новых команд'
                    }),
                    'isBase64Encoded': False
                }
            
            # Генерация турнирной сетки
            if resource == 'generate_bracket':
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("""
                        SELECT id, team_name 
                        FROM t_p68536388_team_registration_si.teams 
                        WHERE status = 'approved'
                        ORDER BY created_at
                    """)
                    approved_teams = cur.fetchall()
                
                if len(approved_teams) < 2:
                    return {
                        'statusCode': 400,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({
                            'success': False,
                            'message': f'Недостаточно команд. Одобрено: {len(approved_teams)}, нужно минимум 2'
                        }),
                        'isBase64Encoded': False
                    }
                
                team_count = len(approved_teams)
                matches_created = 0
                
                with conn.cursor() as cur:
                    cur.execute("DELETE FROM t_p68536388_team_registration_si.matches")
                    
                    match_num = 1
                    
                    import math
                    
                    # Находим ближайшую степень двойки
                    next_power_of_2 = 2 ** math.ceil(math.log2(team_count))
                    
                    # Сколько команд нужно во втором раунде (степень 2)
                    # Команды с баем = разница между степенью 2 и количеством команд
                    teams_with_bye = next_power_of_2 * 2 - team_count
                    
                    # Команды в первом раунде (должно быть чётное число)
                    teams_in_round1 = team_count - teams_with_bye
                    if teams_in_round1 < 0:
                        teams_in_round1 = 0
                    first_round_matches = teams_in_round1 // 2
                    
                    rounds_needed = math.ceil(math.log2(team_count))
                    
                    team_idx = 0
                    
                    # Создаём матчи первого раунда
                    for i in range(first_round_matches):
                        team1_id = approved_teams[team_idx]['id']
                        team2_id = approved_teams[team_idx + 1]['id']
                        
                        cur.execute("""
                            INSERT INTO t_p68536388_team_registration_si.matches 
                            (match_number, bracket_type, round_number, team1_id, team2_id, status)
                            VALUES (%s, %s, %s, %s, %s, %s)
                        """, (match_num, 'upper', 1, team1_id, team2_id, 'upcoming'))
                        
                        match_num += 1
                        matches_created += 1
                        team_idx += 2
                    
                    # Второй раунд: победители первого раунда + команды с баем
                    if rounds_needed >= 2:
                        round2_start = match_num
                        num_round2_matches = next_power_of_2 // 2
                        
                        # Сначала создаём матчи для команд с баем
                        bye_matches = 0
                        while team_idx < team_count and bye_matches < num_round2_matches:
                            if bye_matches < first_round_matches:
                                # Победитель раунда 1 vs команда с баем
                                bye_team_id = approved_teams[team_idx]['id']
                                cur.execute("""
                                    INSERT INTO t_p68536388_team_registration_si.matches 
                                    (match_number, bracket_type, round_number, team1_placeholder, team2_id, status)
                                    VALUES (%s, %s, %s, %s, %s, %s)
                                """, (match_num, 'upper', 2, f'Победитель #{bye_matches + 1}', bye_team_id, 'upcoming'))
                                team_idx += 1
                            else:
                                break
                            match_num += 1
                            matches_created += 1
                            bye_matches += 1
                        
                        # Затем создаём матчи между победителями первого раунда (если есть)
                        remaining_r1_matches = first_round_matches - bye_matches
                        for i in range(remaining_r1_matches // 2):
                            source1 = bye_matches + 1 + i * 2
                            source2 = bye_matches + 2 + i * 2
                            cur.execute("""
                                INSERT INTO t_p68536388_team_registration_si.matches 
                                (match_number, bracket_type, round_number, team1_placeholder, team2_placeholder, status)
                                VALUES (%s, %s, %s, %s, %s, %s)
                            """, (match_num, 'upper', 2, f'Победитель #{source1}', f'Победитель #{source2}', 'upcoming'))
                            match_num += 1
                            matches_created += 1
                        
                        previous_round_start = round2_start
                    else:
                        previous_round_start = 1
                    
                    # Остальные раунды
                    for r in range(3, rounds_needed + 1):
                        num_matches = next_power_of_2 // (2 ** r)
                        for m in range(num_matches):
                            source_match_1 = previous_round_start + (m * 2)
                            source_match_2 = previous_round_start + (m * 2) + 1
                            
                            cur.execute("""
                                INSERT INTO t_p68536388_team_registration_si.matches 
                                (match_number, bracket_type, round_number, team1_placeholder, team2_placeholder, status)
                                VALUES (%s, %s, %s, %s, %s, %s)
                            """, (match_num, 'upper', r, f'Победитель #{source_match_1}', f'Победитель #{source_match_2}', 'upcoming'))
                            match_num += 1
                            matches_created += 1
                        previous_round_start = match_num - num_matches
                    
                    lower_rounds = max(1, (rounds_needed - 1) * 2)
                    lower_start = match_num
                    for r in range(1, lower_rounds + 1):
                        if r % 2 == 1:
                            num_matches = max(1, first_round_matches // (2 ** ((r + 1) // 2)))
                        else:
                            num_matches = max(1, first_round_matches // (2 ** (r // 2 + 1)))
                        
                        for m in range(num_matches):
                            if r == 1:
                                placeholder = f'TBD (Раунд {r})'
                            else:
                                placeholder = f'TBD (Lower {r})'
                            
                            cur.execute("""
                                INSERT INTO t_p68536388_team_registration_si.matches 
                                (match_number, bracket_type, round_number, team1_placeholder, team2_placeholder, status)
                                VALUES (%s, %s, %s, %s, %s, %s)
                            """, (match_num, 'lower', r, placeholder, placeholder, 'upcoming'))
                            match_num += 1
                            matches_created += 1
                    
                    cur.execute("""
                        INSERT INTO t_p68536388_team_registration_si.matches 
                        (match_number, bracket_type, round_number, team1_placeholder, team2_placeholder, status)
                        VALUES (%s, %s, %s, %s, %s, %s)
                    """, (match_num, 'grand_final', 1, 'Победитель верхней сетки', 'Победитель нижней сетки', 'upcoming'))
                    matches_created += 1
                    
                    conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': True,
                        'matches_created': matches_created,
                        'teams_count': team_count,
                        'message': f'Создана сетка для {team_count} команд, матчей: {matches_created}'
                    }),
                    'isBase64Encoded': False
                }
            
            # Очистка списка команд
            if resource == 'clear_teams':
                with conn.cursor() as cur:
                    cur.execute("SELECT COUNT(*) FROM t_p68536388_team_registration_si.teams")
                    teams_count = cur.fetchone()[0]
                    
                    cur.execute("DELETE FROM t_p68536388_team_registration_si.matches")
                    cur.execute("DELETE FROM t_p68536388_team_registration_si.teams")
                    conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': True,
                        'message': f'Удалено команд: {teams_count}, турнирная сетка очищена'
                    }),
                    'isBase64Encoded': False
                }
            
            # Импорт с Challonge
            if resource == 'import_challonge':
                challonge_url = body_data.get('url', '')
                
                # Извлекаем ID турнира из URL
                tournament_id = challonge_url.strip('/').split('/')[-1]
                if not tournament_id or tournament_id == 'ru':
                    parts = [p for p in challonge_url.split('/') if p and p != 'ru']
                    tournament_id = parts[-1] if parts else ''
                
                if not tournament_id:
                    return {
                        'statusCode': 400,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({
                            'success': False,
                            'message': 'Не удалось извлечь ID турнира из URL'
                        }),
                        'isBase64Encoded': False
                    }
                
                # Получаем HTML страницу турнира и парсим JSON данные
                try:
                    # Challonge встраивает JSON с данными турнира прямо в HTML
                    url = f'https://challonge.com/{tournament_id}.json'
                    print(f'Запрос к Challonge: {tournament_id}')
                    req = urllib.request.Request(url)
                    with urllib.request.urlopen(req, timeout=10) as response:
                        tournament_data = json.loads(response.read().decode())
                        print(f'Турнир получен: {tournament_data.get("name", "unknown")}')
                except urllib.error.HTTPError as e:
                    error_body = e.read().decode() if hasattr(e, 'read') else str(e)
                    print(f'HTTP Error {e.code}: {error_body}')
                    return {
                        'statusCode': 400,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({
                            'success': False,
                            'message': f'Не удалось найти турнир по адресу {challonge_url}. Убедитесь что турнир публичный и ссылка правильная.'
                        }),
                        'isBase64Encoded': False
                    }
                except Exception as e:
                    print(f'Ошибка запроса: {type(e).__name__}: {str(e)}')
                    return {
                        'statusCode': 400,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({
                            'success': False,
                            'message': f'Ошибка загрузки турнира: {str(e)}'
                        }),
                        'isBase64Encoded': False
                    }
                
                # Извлекаем участников и матчи из JSON
                participants_data = tournament_data.get('participants', [])
                matches_data = tournament_data.get('matches', [])
                
                # Очищаем существующие данные
                with conn.cursor() as cur:
                    cur.execute("DELETE FROM t_p68536388_team_registration_si.matches")
                    cur.execute("DELETE FROM t_p68536388_team_registration_si.teams WHERE status = 'approved'")
                    
                    # Маппинг challonge ID -> наш ID
                    participant_map = {}
                    
                    # Создаём команды
                    for p in participants_data:
                        participant = p.get('participant', p)
                        cur.execute("""
                            INSERT INTO t_p68536388_team_registration_si.teams 
                            (team_name, captain_name, captain_telegram, members_count, members_info, status)
                            VALUES (%s, %s, %s, %s, %s, %s)
                            RETURNING id
                        """, (
                            participant.get('name', participant.get('display_name', 'Неизвестная команда')),
                            'Импорт Challonge',
                            f"seed_{participant.get('seed', 0)}",
                            5,
                            'Импортировано с Challonge',
                            'approved'
                        ))
                        team_id = cur.fetchone()[0]
                        participant_map[participant['id']] = team_id
                    
                    # Создаём матчи
                    matches_created = 0
                    for m in matches_data:
                        match = m.get('match', m)
                        
                        team1_id = participant_map.get(match.get('player1_id'))
                        team2_id = participant_map.get(match.get('player2_id'))
                        
                        # Определяем статус
                        status = 'upcoming'
                        if match.get('state') == 'complete':
                            status = 'finished'
                        elif match.get('state') == 'open':
                            status = 'live'
                        
                        # Определяем победителя
                        winner = None
                        if match.get('winner_id'):
                            if match['winner_id'] == match.get('player1_id'):
                                winner = 1
                            elif match['winner_id'] == match.get('player2_id'):
                                winner = 2
                        
                        # Парсим счёт
                        score1 = None
                        score2 = None
                        scores_csv = match.get('scores_csv', '')
                        if scores_csv and '-' in scores_csv:
                            parts = scores_csv.split('-')
                            score1 = parts[0].strip() if len(parts) > 0 else None
                            score2 = parts[1].strip() if len(parts) > 1 else None
                        
                        if team1_id and team2_id:
                            cur.execute("""
                                INSERT INTO t_p68536388_team_registration_si.matches 
                                (match_number, bracket_type, round_number, team1_id, team2_id, 
                                 score1, score2, winner, status)
                                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                            """, (
                                match.get('suggested_play_order', matches_created + 1),
                                'upper',
                                match.get('round', 1),
                                team1_id,
                                team2_id,
                                score1,
                                score2,
                                winner,
                                status
                            ))
                            matches_created += 1
                    
                    conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': True,
                        'teams_count': len(participants_data),
                        'matches_count': matches_created,
                        'message': f'Импортировано: {len(participants_data)} команд, {matches_created} матчей'
                    }),
                    'isBase64Encoded': False
                }
            
            # Очистка турнирной сетки
            if resource == 'clear_bracket':
                with conn.cursor() as cur:
                    cur.execute("DELETE FROM t_p68536388_team_registration_si.matches")
                    conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': True,
                        'message': 'Турнирная сетка очищена'
                    }),
                    'isBase64Encoded': False
                }
            
            # Перемешать команды и создать новую сетку
            if resource == 'shuffle_and_generate':
                import random
                
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("""
                        SELECT id, team_name 
                        FROM t_p68536388_team_registration_si.teams 
                        WHERE status = 'approved'
                        ORDER BY created_at
                    """)
                    approved_teams = cur.fetchall()
                
                if len(approved_teams) < 2:
                    return {
                        'statusCode': 400,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({
                            'success': False,
                            'message': f'Недостаточно команд. Одобрено: {len(approved_teams)}, нужно минимум 2'
                        }),
                        'isBase64Encoded': False
                    }
                
                # Перемешиваем команды
                shuffled_teams = list(approved_teams)
                random.shuffle(shuffled_teams)
                
                team_count = len(shuffled_teams)
                matches_created = 0
                
                with conn.cursor() as cur:
                    cur.execute("DELETE FROM t_p68536388_team_registration_si.matches")
                    
                    match_num = 1
                    
                    import math
                    rounds_needed = math.ceil(math.log2(team_count))
                    
                    for i in range(0, team_count, 2):
                        team1_id = shuffled_teams[i]['id']
                        team2_id = shuffled_teams[i+1]['id'] if i+1 < team_count else None
                        
                        if team2_id:
                            cur.execute("""
                                INSERT INTO t_p68536388_team_registration_si.matches 
                                (match_number, bracket_type, round_number, team1_id, team2_id, status)
                                VALUES (%s, %s, %s, %s, %s, %s)
                            """, (match_num, 'upper', 1, team1_id, team2_id, 'upcoming'))
                        else:
                            cur.execute("""
                                INSERT INTO t_p68536388_team_registration_si.matches 
                                (match_number, bracket_type, round_number, team1_id, team1_placeholder, status)
                                VALUES (%s, %s, %s, %s, %s, %s)
                            """, (match_num, 'upper', 1, team1_id, 'BYE', 'upcoming'))
                        match_num += 1
                        matches_created += 1
                    
                    first_round_matches = (team_count + 1) // 2
                    
                    previous_round_start = 1
                    for r in range(2, rounds_needed + 1):
                        num_matches = max(1, first_round_matches // (2 ** (r - 1)))
                        for m in range(num_matches):
                            source_match_1 = previous_round_start + (m * 2)
                            source_match_2 = previous_round_start + (m * 2) + 1
                            
                            cur.execute("""
                                INSERT INTO t_p68536388_team_registration_si.matches 
                                (match_number, bracket_type, round_number, team1_placeholder, team2_placeholder, status)
                                VALUES (%s, %s, %s, %s, %s, %s)
                            """, (match_num, 'upper', r, f'Победитель #{source_match_1}', f'Победитель #{source_match_2}', 'upcoming'))
                            match_num += 1
                            matches_created += 1
                        previous_round_start = match_num - num_matches
                    
                    lower_rounds = max(1, (rounds_needed - 1) * 2)
                    lower_start = match_num
                    for r in range(1, lower_rounds + 1):
                        if r % 2 == 1:
                            num_matches = max(1, first_round_matches // (2 ** ((r + 1) // 2)))
                        else:
                            num_matches = max(1, first_round_matches // (2 ** (r // 2 + 1)))
                        
                        for m in range(num_matches):
                            if r == 1:
                                placeholder = f'TBD (Раунд {r})'
                            else:
                                placeholder = f'TBD (Lower {r})'
                            
                            cur.execute("""
                                INSERT INTO t_p68536388_team_registration_si.matches 
                                (match_number, bracket_type, round_number, team1_placeholder, team2_placeholder, status)
                                VALUES (%s, %s, %s, %s, %s, %s)
                            """, (match_num, 'lower', r, placeholder, placeholder, 'upcoming'))
                            match_num += 1
                            matches_created += 1
                    
                    cur.execute("""
                        INSERT INTO t_p68536388_team_registration_si.matches 
                        (match_number, bracket_type, round_number, team1_placeholder, team2_placeholder, status)
                        VALUES (%s, %s, %s, %s, %s, %s)
                    """, (match_num, 'grand_final', 1, 'Победитель верхней сетки', 'Победитель нижней сетки', 'upcoming'))
                    matches_created += 1
                    
                    conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': True,
                        'matches_created': matches_created,
                        'teams_count': team_count,
                        'message': f'Команды перемешаны. Создана сетка для {team_count} команд, матчей: {matches_created}'
                    }),
                    'isBase64Encoded': False
                }
            
            # Массовое создание команд
            if resource == 'bulk_create':
                team_names = body_data.get('team_names', [])
                
                if not team_names:
                    return {
                        'statusCode': 400,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({
                            'success': False,
                            'message': 'Список названий команд пуст'
                        }),
                        'isBase64Encoded': False
                    }
                
                created_count = 0
                skipped_count = 0
                skipped_teams = []
                
                with conn.cursor() as cur:
                    for idx, team_name in enumerate(team_names):
                        team_name_clean = team_name.strip()
                        if not team_name_clean:
                            continue
                        
                        cur.execute("""
                            SELECT team_name FROM t_p68536388_team_registration_si.teams 
                            WHERE team_name = %s
                        """, (team_name_clean,))
                        
                        if cur.fetchone():
                            skipped_count += 1
                            skipped_teams.append(team_name_clean)
                            continue
                        
                        try:
                            cur.execute("""
                                INSERT INTO t_p68536388_team_registration_si.teams 
                                (team_name, captain_name, captain_telegram, members_count, members_info, captain_email, status)
                                VALUES (%s, %s, %s, %s, %s, %s, %s)
                            """, (
                                team_name_clean,
                                'Admin',
                                f'admin_{idx}',
                                5,
                                'Состав не указан',
                                'admin@tournament.com',
                                'approved'
                            ))
                            created_count += 1
                        except Exception as e:
                            skipped_count += 1
                            skipped_teams.append(team_name_clean)
                            print(f"Failed to create team {team_name_clean}: {e}")
                            continue
                    
                    conn.commit()
                
                message = f'Создано команд: {created_count}'
                if skipped_count > 0:
                    message += f', пропущено (дубликаты): {skipped_count}'
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': True,
                        'created': created_count,
                        'skipped': skipped_count,
                        'skipped_teams': skipped_teams[:5] if skipped_teams else [],
                        'message': message
                    }),
                    'isBase64Encoded': False
                }
            
            # Создать новую заявку
            # Формируем members_info из всех полей
            members_list = [
                f"Топ: {body_data.get('top_player', '')} - Телеграм: {body_data.get('top_telegram', '')}",
                f"Лес: {body_data.get('jungle_player', '')} - Телеграм: {body_data.get('jungle_telegram', '')}",
                f"Мид: {body_data.get('mid_player', '')} - Телеграм: {body_data.get('mid_telegram', '')}",
                f"АДК: {body_data.get('adc_player', '')} - Телеграм: {body_data.get('adc_telegram', '')}",
                f"Саппорт: {body_data.get('support_player', '')} - Телеграм: {body_data.get('support_telegram', '')}"
            ]
            
            if body_data.get('sub1_player'):
                members_list.append(f"Запасной 1: {body_data.get('sub1_player', '')} - Телеграм: {body_data.get('sub1_telegram', '')}")
            if body_data.get('sub2_player'):
                members_list.append(f"Запасной 2: {body_data.get('sub2_player', '')} - Телеграм: {body_data.get('sub2_telegram', '')}")
            
            members_info = '\n'.join(members_list)
            
            try:
                with conn.cursor() as cur:
                    # Проверка на существующего капитана
                    cur.execute("""
                        SELECT id FROM t_p68536388_team_registration_si.teams 
                        WHERE captain_telegram = %s
                    """, (body_data['captain_telegram'],))
                    
                    existing_team = cur.fetchone()
                    if existing_team:
                        return {
                            'statusCode': 409,
                            'headers': {
                                'Content-Type': 'application/json',
                                'Access-Control-Allow-Origin': '*'
                            },
                            'body': json.dumps({'error': 'Вы уже зарегистрировали команду. Один человек может зарегистрировать только одну команду.'}),
                            'isBase64Encoded': False
                        }
                    
                    cur.execute("""
                        INSERT INTO t_p68536388_team_registration_si.teams 
                        (team_name, captain_name, captain_telegram, members_count, members_info, captain_email)
                        VALUES (%s, %s, %s, %s, %s, %s)
                        RETURNING id
                    """, (
                        body_data['team_name'],
                        body_data['captain_name'],
                        body_data['captain_telegram'],
                        5,
                        members_info,
                        body_data.get('captain_email', 'no-email@provided.com')
                    ))
                    team_id = cur.fetchone()[0]
                    conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'id': team_id, 
                        'message': 'Team registered successfully'
                    }),
                    'isBase64Encoded': False
                }
            except Exception as e:
                if 'duplicate key' in str(e).lower() or 'unique' in str(e).lower():
                    return {
                        'statusCode': 409,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'error': 'Вы уже зарегистрировали команду. Один человек может зарегистрировать только одну команду.'}),
                        'isBase64Encoded': False
                    }
                raise
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            resource = body_data.get('resource')
            
            # Обновить матч
            if resource == 'match':
                match_id = body_data.get('match_id')
                
                if not match_id:
                    return {
                        'statusCode': 400,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'success': False, 'message': 'match_id required'}),
                        'isBase64Encoded': False
                    }
                
                with conn.cursor() as cur:
                    cur.execute("""
                        UPDATE t_p68536388_team_registration_si.matches 
                        SET team1_id = %s, team2_id = %s, score1 = %s, score2 = %s, 
                            winner = %s, status = %s, scheduled_time = %s, updated_at = CURRENT_TIMESTAMP
                        WHERE id = %s
                    """, (
                        body_data.get('team1_id'),
                        body_data.get('team2_id'),
                        body_data.get('score1'),
                        body_data.get('score2'),
                        body_data.get('winner'),
                        body_data.get('status'),
                        body_data.get('scheduled_time'),
                        match_id
                    ))
                    conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'success': True, 'message': 'Match updated'}),
                    'isBase64Encoded': False
                }
            
            # Обновить статус команды (только для админа)
            team_id = body_data.get('id')
            new_status = body_data.get('status')
            admin_comment = body_data.get('admin_comment', '')
            
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE t_p68536388_team_registration_si.teams 
                    SET status = %s, admin_comment = %s, updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                """, (new_status, admin_comment, team_id))
                conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'message': 'Team status updated'}),
                'isBase64Encoded': False
            }
        
        elif method == 'PATCH':
            # Обновить команду
            body_data = json.loads(event.get('body', '{}'))
            team_id = body_data.get('id')
            team_name = body_data.get('team_name')
            captain_name = body_data.get('captain_name')
            captain_telegram = body_data.get('captain_telegram')
            members_info = body_data.get('members_info')
            
            if not team_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Team ID is required'}),
                    'isBase64Encoded': False
                }
            
            action_data = {
                'team_name': team_name,
                'captain_name': captain_name,
                'captain_telegram': captain_telegram,
                'members_info': members_info
            }
            
            action_id = create_pending_action(conn, team_id, 'update', action_data)
            send_confirmation_request(conn, team_id, action_id, 'update', action_data)
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'message': 'Confirmation request sent to captain'}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            # Удалить команду
            params = event.get('queryStringParameters', {})
            team_id = params.get('id')
            
            action_id = create_pending_action(conn, int(team_id), 'delete', {})
            send_confirmation_request(conn, int(team_id), action_id, 'delete', {})
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'message': 'Confirmation request sent to captain'}),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    
    finally:
        conn.close()

def create_pending_action(conn, team_id: int, action_type: str, action_data: dict) -> int:
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO t_p68536388_team_registration_si.pending_actions 
            (team_id, action_type, action_data, status)
            VALUES (%s, %s, %s, 'pending')
            RETURNING id
        """, (team_id, action_type, json.dumps(action_data)))
        action_id = cur.fetchone()[0]
        conn.commit()
        return action_id

def send_confirmation_request(conn, team_id: int, action_id: int, action_type: str, action_data: dict):
    try:
        bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
        if not bot_token:
            return
        
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT team_name, captain_name, captain_telegram, members_info
                FROM t_p68536388_team_registration_si.teams 
                WHERE id = %s
            """, (team_id,))
            team = cur.fetchone()
        
        if not team or not team['captain_telegram']:
            return
        
        telegram = team['captain_telegram']
        if not telegram.startswith('@'):
            return
        
        username = telegram[1:]
        
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT chat_id FROM t_p68536388_team_registration_si.telegram_users 
                WHERE username = %s
            """, (username,))
            user = cur.fetchone()
        
        if not user:
            return
        
        chat_id = user['chat_id']
        
        if action_type == 'update':
            message = (
                f"⚠️ <b>Запрос на изменение команды</b>\n\n"
                f"🏆 Текущая команда: {team['team_name']}\n\n"
                f"📝 <b>Новые данные:</b>\n"
                f"Название: {action_data.get('team_name', team['team_name'])}\n"
                f"Капитан: {action_data.get('captain_name', team['captain_name'])}\n"
                f"Telegram: {action_data.get('captain_telegram', team['captain_telegram'])}\n\n"
                f"📋 Новый состав:\n{action_data.get('members_info', team['members_info'])}\n\n"
                f"Подтвердите или отклоните изменения:"
            )
        elif action_type == 'delete':
            message = (
                f"❌ <b>Запрос на удаление команды</b>\n\n"
                f"🏆 Команда: {team['team_name']}\n"
                f"👤 Капитан: {team['captain_name']}\n\n"
                f"⚠️ Это действие нельзя отменить!\n\n"
                f"Подтвердите или отклоните удаление:"
            )
        else:
            return
        
        keyboard = {
            'inline_keyboard': [[
                {'text': '✅ Подтвердить', 'callback_data': f'confirm_{action_id}'},
                {'text': '❌ Отклонить', 'callback_data': f'cancel_{action_id}'}
            ]]
        }
        
        send_message_with_keyboard(bot_token, chat_id, message, keyboard)
    except Exception as e:
        print(f"Failed to send confirmation request: {str(e)}")

def send_message_with_keyboard(bot_token: str, chat_id: int, text: str, keyboard: dict):
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    data = {
        'chat_id': chat_id,
        'text': text,
        'parse_mode': 'HTML',
        'reply_markup': keyboard
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"Failed to send message: {str(e)}")
        return None