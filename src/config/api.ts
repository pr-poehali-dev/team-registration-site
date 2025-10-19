// API Configuration
// Переключите USE_TIMEWEB_API в true для использования PHP API на Timeweb
// Переключите в false для использования backend функций на poehali.dev

const USE_TIMEWEB_API = false;

export const API_CONFIG = {
  TEAMS_URL: USE_TIMEWEB_API 
    ? '/php-backend/api/teams.php'
    : 'https://functions.poehali.dev/770caae7-f99a-46a7-9d02-36b5270e76fe',
  
  SETTINGS_URL: USE_TIMEWEB_API
    ? '/php-backend/api/teams.php'
    : 'https://functions.poehali.dev/770caae7-f99a-46a7-9d02-36b5270e76fe',
  
  AUTH_URL: USE_TIMEWEB_API
    ? '/php-backend/api/teams.php'
    : 'https://functions.poehali.dev/770caae7-f99a-46a7-9d02-36b5270e76fe'
};