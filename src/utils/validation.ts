/**
 * Utilitários de validação
 * Centraliza todas as regras de validação da aplicação
 */

/**
 * Valida força de senha
 * @param password - Senha a ser validada
 * @returns Mensagem de erro ou string vazia se válida
 */
export const validatePassword = (password: string): string => {
  if (password.length < 8) {
    return 'A senha deve ter no mínimo 8 caracteres';
  }
  if (!/[A-Z]/.test(password)) {
    return 'A senha deve conter pelo menos uma letra maiúscula';
  }
  if (!/[a-z]/.test(password)) {
    return 'A senha deve conter pelo menos uma letra minúscula';
  }
  if (!/[0-9]/.test(password)) {
    return 'A senha deve conter pelo menos um número';
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return 'A senha deve conter pelo menos um caractere especial (!@#$%^&*()_+-=[]{};\':"\\|,.<>/?)';
  }
  return '';
};

/**
 * Valida formato de email
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Requisitos de senha para exibição em UI
 */
export const getPasswordRequirements = (password: string) => ({
  minLength: password.length >= 8,
  hasUpperCase: /[A-Z]/.test(password),
  hasLowerCase: /[a-z]/.test(password),
  hasNumber: /[0-9]/.test(password),
  hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
});

/**
 * Verifica se senha atende todos os requisitos
 */
export const isPasswordValid = (password: string): boolean => {
  const requirements = getPasswordRequirements(password);
  return Object.values(requirements).every(req => req === true);
};
