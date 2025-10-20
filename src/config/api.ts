// API Configuration
// Переключите USE_TIMEWEB_API в true для использования PHP API на Timeweb
// Переключите в false для использования backend функций на poehali.dev

const USE_TIMEWEB_API = false;

export const API_CONFIG = {
  TEAMS_URL: USE_TIMEWEB_API 
    ? '/php-backend/api/teams.php'
    : 'https://functions.poehali.dev/65f0f8df-228a-4bd5-ab3d-1ab2c6a091ca',
  
  SETTINGS_URL: USE_TIMEWEB_API
    ? '/php-backend/api/teams.php'
    : 'https://functions.poehali.dev/65f0f8df-228a-4bd5-ab3d-1ab2c6a091ca',
  
  AUTH_URL: USE_TIMEWEB_API
    ? '/php-backend/api/teams.php'
    : 'https://functions.poehali.dev/65f0f8df-228a-4bd5-ab3d-1ab2c6a091ca'
};