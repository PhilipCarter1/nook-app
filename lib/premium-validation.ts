export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class PremiumValidator {
  static validate(value: any, rules: ValidationRule): ValidationResult {
    const errors: string[] = [];

    if (rules.required && (!value || value.toString().trim() === '')) {
      errors.push('This field is required');
    }

    if (value && rules.minLength && value.toString().length < rules.minLength) {
      errors.push(`Minimum length is ${rules.minLength} characters`);
    }

    if (value && rules.maxLength && value.toString().length > rules.maxLength) {
      errors.push(`Maximum length is ${rules.maxLength} characters`);
    }

    if (value && rules.pattern && !rules.pattern.test(value.toString())) {
      errors.push('Invalid format');
    }

    if (value && rules.custom) {
      const customResult = rules.custom(value);
      if (typeof customResult === 'string') {
        errors.push(customResult);
      } else if (!customResult) {
        errors.push('Invalid value');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateEmail(email: string): ValidationResult {
    return this.validate(email, {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    });
  }

  static validatePassword(password: string): ValidationResult {
    return this.validate(password, {
      required: true,
      minLength: 8,
      custom: (value) => {
        const hasUpperCase = /[A-Z]/.test(value);
        const hasLowerCase = /[a-z]/.test(value);
        const hasNumbers = /\d/.test(value);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
        
        if (!hasUpperCase) return 'Password must contain at least one uppercase letter';
        if (!hasLowerCase) return 'Password must contain at least one lowercase letter';
        if (!hasNumbers) return 'Password must contain at least one number';
        if (!hasSpecialChar) return 'Password must contain at least one special character';
        
        return true;
      }
    });
  }
}
