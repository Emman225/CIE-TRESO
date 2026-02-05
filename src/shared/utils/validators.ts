import { APP_CONFIG } from '@/shared/constants/appConfig';

export interface ValidationResult {
  isValid: boolean;
  message: string;
}

const VALID: ValidationResult = { isValid: true, message: '' };

/**
 * Valide une adresse email.
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim().length === 0) {
    return { isValid: false, message: 'L\'adresse email est requise.' };
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'L\'adresse email n\'est pas valide.' };
  }

  return VALID;
}

/**
 * Valide qu'un champ obligatoire est rempli.
 */
export function validateRequired(value: string | undefined | null, fieldName: string): ValidationResult {
  if (!value || value.trim().length === 0) {
    return { isValid: false, message: `Le champ "${fieldName}" est requis.` };
  }
  return VALID;
}

/**
 * Valide la robustesse d'un mot de passe.
 * Minimum 8 caracteres, au moins une majuscule, une minuscule, un chiffre et un caractere special.
 */
export function validatePassword(password: string): ValidationResult {
  if (!password || password.length < APP_CONFIG.passwordMinLength) {
    return {
      isValid: false,
      message: `Le mot de passe doit contenir au moins ${APP_CONFIG.passwordMinLength} caracteres.`,
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'Le mot de passe doit contenir au moins une lettre majuscule.',
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: 'Le mot de passe doit contenir au moins une lettre minuscule.',
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      message: 'Le mot de passe doit contenir au moins un chiffre.',
    };
  }

  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return {
      isValid: false,
      message: 'Le mot de passe doit contenir au moins un caractere special.',
    };
  }

  return VALID;
}

/**
 * Valide la confirmation du mot de passe.
 */
export function validatePasswordConfirmation(password: string, confirmation: string): ValidationResult {
  if (password !== confirmation) {
    return { isValid: false, message: 'Les mots de passe ne correspondent pas.' };
  }
  return VALID;
}

/**
 * Valide un numero de telephone ivoirien (10 chiffres).
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone || phone.trim().length === 0) {
    return VALID;
  }

  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length !== 10) {
    return { isValid: false, message: 'Le numero de telephone doit contenir 10 chiffres.' };
  }

  return VALID;
}

/**
 * Valide qu'un montant est un nombre positif.
 */
export function validatePositiveAmount(amount: number | string, fieldName: string): ValidationResult {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(num)) {
    return { isValid: false, message: `Le champ "${fieldName}" doit etre un nombre valide.` };
  }

  if (num < 0) {
    return { isValid: false, message: `Le champ "${fieldName}" ne peut pas etre negatif.` };
  }

  return VALID;
}

/**
 * Valide une longueur minimale.
 */
export function validateMinLength(value: string, minLength: number, fieldName: string): ValidationResult {
  if (value.length < minLength) {
    return {
      isValid: false,
      message: `Le champ "${fieldName}" doit contenir au moins ${minLength} caracteres.`,
    };
  }
  return VALID;
}

/**
 * Valide une longueur maximale.
 */
export function validateMaxLength(value: string, maxLength: number, fieldName: string): ValidationResult {
  if (value.length > maxLength) {
    return {
      isValid: false,
      message: `Le champ "${fieldName}" ne doit pas depasser ${maxLength} caracteres.`,
    };
  }
  return VALID;
}

/**
 * Execute plusieurs validations et retourne le premier echec ou succes.
 */
export function validateAll(...results: ValidationResult[]): ValidationResult {
  for (const result of results) {
    if (!result.isValid) return result;
  }
  return VALID;
}
