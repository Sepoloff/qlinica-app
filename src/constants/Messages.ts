/**
 * App Messages & Error Strings
 * Centralized text for consistency and easy translation
 */

export const MESSAGES = {
  // Auth
  AUTH: {
    LOGIN_SUCCESS: '✅ Bem-vindo de volta!',
    LOGOUT_SUCCESS: '✅ Sessão terminada',
    REGISTER_SUCCESS: '✅ Conta criada com sucesso',
    INVALID_CREDENTIALS: 'Email ou password incorretos',
    SESSION_EXPIRED: 'Sessão expirada. Por favor, inicie sessão novamente',
    AUTH_REQUIRED: 'Autenticação necessária para esta ação',
  },

  // Booking
  BOOKING: {
    BOOKING_CREATED: '✅ Consulta agendada com sucesso',
    BOOKING_CANCELLED: '✅ Consulta cancelada',
    BOOKING_RESCHEDULED: '✅ Consulta reagendada',
    BOOKING_CONFIRMED: 'Consulta confirmada',
    BOOKING_STARTED: 'Iniciando novo agendamento...',
    CANCEL_CONFIRMATION: 'Tem certeza que deseja cancelar esta consulta?',
    RESCHEDULE_CONFIRMATION: 'Deseja reagendar esta consulta para outra data?',
  },

  // Profile
  PROFILE: {
    PHONE_UPDATED: '✅ Telefone atualizado',
    PREFERENCES_SAVED: '✅ Preferências guardadas',
    PROFILE_UPDATED: '✅ Perfil atualizado',
    LOGOUT_CONFIRMATION: 'Tem certeza que deseja terminar a sessão?',
  },

  // Validation Errors
  VALIDATION: {
    EMAIL_REQUIRED: 'Email é obrigatório',
    EMAIL_INVALID: 'Email inválido',
    PASSWORD_REQUIRED: 'Password é obrigatória',
    PASSWORD_WEAK: 'Password fraca (mín. 8 caracteres, 1 maiúscula, 1 número)',
    PASSWORD_MISMATCH: 'As passwords não coincidem',
    NAME_REQUIRED: 'Nome é obrigatório',
    NAME_TOO_SHORT: 'Nome deve ter pelo menos 2 caracteres',
    PHONE_REQUIRED: 'Telefone é obrigatório',
    PHONE_INVALID: 'Telefone inválido (ex: +351 912345678)',
    DATE_REQUIRED: 'Data é obrigatória',
    DATE_PAST: 'Não pode selecionar uma data no passado',
    TIME_REQUIRED: 'Hora é obrigatória',
    SERVICE_REQUIRED: 'Selecione um serviço',
    THERAPIST_REQUIRED: 'Selecione um terapeuta',
  },

  // Network & API
  NETWORK: {
    NO_CONNECTION: 'Sem conexão à internet',
    TIMEOUT: 'Pedido expirou. Tente novamente',
    SERVER_ERROR: 'Erro no servidor. Tente mais tarde',
    UNKNOWN_ERROR: 'Algo correu mal. Tente novamente',
    RETRY_FAILED: 'Falha ao tentar novamente',
  },

  // General
  GENERAL: {
    LOADING: 'Carregando...',
    LOADING_DATA: 'Carregando dados...',
    TRYING_AGAIN: 'Tentando novamente...',
    NO_DATA: 'Sem dados para mostrar',
    TRY_AGAIN: 'Tentar novamente',
    CANCEL: 'Cancelar',
    CONFIRM: 'Confirmar',
    OK: 'OK',
    CLOSE: 'Fechar',
    SAVE: 'Guardar',
    DELETE: 'Apagar',
    EDIT: 'Editar',
    LOADING_SKELETON: 'Carregando...',
    SEARCH: 'Pesquisar',
    FILTER: 'Filtrar',
    SORT: 'Ordenar',
  },

  // Empty States
  EMPTY_STATES: {
    NO_BOOKINGS: 'Nenhuma consulta agendada',
    NO_SERVICES: 'Nenhum serviço disponível',
    NO_THERAPISTS: 'Nenhum terapeuta disponível',
    NO_RESULTS: 'Nenhum resultado encontrado',
    NO_NOTIFICATIONS: 'Nenhuma notificação',
  },

  // Notifications
  NOTIFICATIONS: {
    BOOKING_REMINDER: 'Lembrete: Tem uma consulta amanhã',
    BOOKING_CONFIRMED: 'Consulta confirmada',
    BOOKING_CANCELLED: 'Consulta cancelada',
    THERAPIST_AVAILABLE: 'Novo horário disponível',
  },

  // Permissions
  PERMISSIONS: {
    NOTIFICATION_PERMISSION: 'Precisamos da sua autorização para enviar notificações',
    LOCATION_PERMISSION: 'Precisamos da sua localização',
    CAMERA_PERMISSION: 'Precisamos do acesso à câmera',
    CONTACTS_PERMISSION: 'Precisamos do acesso aos contactos',
  },
} as const;

/**
 * Get error message based on error code
 */
export const getErrorMessage = (code: string | number, fallback: string = MESSAGES.NETWORK.UNKNOWN_ERROR): string => {
  const errorMap: Record<string | number, string> = {
    // HTTP Status Codes
    400: MESSAGES.VALIDATION.EMAIL_INVALID,
    401: MESSAGES.AUTH.SESSION_EXPIRED,
    403: 'Acesso negado',
    404: 'Recurso não encontrado',
    429: 'Muitas tentativas. Tente mais tarde',
    500: MESSAGES.NETWORK.SERVER_ERROR,
    503: 'Serviço indisponível. Tente mais tarde',

    // Custom Error Codes
    'INVALID_EMAIL': MESSAGES.VALIDATION.EMAIL_INVALID,
    'WEAK_PASSWORD': MESSAGES.VALIDATION.PASSWORD_WEAK,
    'NO_CONNECTION': MESSAGES.NETWORK.NO_CONNECTION,
    'TIMEOUT': MESSAGES.NETWORK.TIMEOUT,
    'AUTH_REQUIRED': MESSAGES.AUTH.AUTH_REQUIRED,
  };

  return errorMap[code] || fallback;
};
