export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0-5
  feedback: string[];
  strength: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
}

export interface PasswordRequirement {
  regex: RegExp;
  message: string;
  met: boolean;
}

// Common passwords to avoid (simplified list)
const COMMON_PASSWORDS = [
  'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
  'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'password1'
];

export class PasswordValidator {
  private static readonly REQUIREMENTS = {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxCommonPasswordMatches: 0
  };

  /**
   * Validate password strength and provide feedback
   */
  static validate(password: string, email?: string): PasswordValidationResult {
    const feedback: string[] = [];
    let score = 0;
    const requirements: PasswordRequirement[] = [];

    // Check length
    const lengthMet = password.length >= this.REQUIREMENTS.minLength && password.length <= this.REQUIREMENTS.maxLength;
    requirements.push({
      regex: /.{8,128}/,
      message: `Password must be between ${this.REQUIREMENTS.minLength} and ${this.REQUIREMENTS.maxLength} characters`,
      met: lengthMet
    });
    if (lengthMet) score += 1;

    // Check uppercase
    const uppercaseMet = this.REQUIREMENTS.requireUppercase ? /[A-Z]/.test(password) : true;
    requirements.push({
      regex: /[A-Z]/,
      message: 'Password must contain at least one uppercase letter',
      met: uppercaseMet
    });
    if (uppercaseMet) score += 1;

    // Check lowercase
    const lowercaseMet = this.REQUIREMENTS.requireLowercase ? /[a-z]/.test(password) : true;
    requirements.push({
      regex: /[a-z]/,
      message: 'Password must contain at least one lowercase letter',
      met: lowercaseMet
    });
    if (lowercaseMet) score += 1;

    // Check numbers
    const numbersMet = this.REQUIREMENTS.requireNumbers ? /\d/.test(password) : true;
    requirements.push({
      regex: /\d/,
      message: 'Password must contain at least one number',
      met: numbersMet
    });
    if (numbersMet) score += 1;

    // Check special characters
    const specialMet = this.REQUIREMENTS.requireSpecialChars ? /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) : true;
    requirements.push({
      regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
      message: 'Password must contain at least one special character',
      met: specialMet
    });
    if (specialMet) score += 1;

    // Check for common passwords
    const isCommonPassword = COMMON_PASSWORDS.includes(password.toLowerCase());
    if (isCommonPassword) {
      feedback.push('Password is too common. Please choose a more unique password.');
      score = Math.max(0, score - 2);
    }

    // Check if password contains email (if provided)
    if (email && password.toLowerCase().includes(email.toLowerCase().split('@')[0])) {
      feedback.push('Password should not contain parts of your email address.');
      score = Math.max(0, score - 1);
    }

    // Check for sequential characters (e.g., "123", "abc")
    if (/(?:012|123|234|345|456|567|678|789|987|876|765|654|543|432|321|210|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password)) {
      feedback.push('Password should not contain sequential characters.');
      score = Math.max(0, score - 1);
    }

    // Check for repeated characters (e.g., "aaa", "111")
    if (/(.)\1{2,}/.test(password)) {
      feedback.push('Password should not contain repeated characters.');
      score = Math.max(0, score - 1);
    }

    // Add requirement feedback
    requirements.forEach(req => {
      if (!req.met) {
        feedback.push(req.message);
      }
    });

    // Determine strength level
    const strength = this.getStrengthLevel(score);

    return {
      isValid: score >= 4 && !isCommonPassword && feedback.filter(f => !f.includes('Password must contain')).length === 0,
      score,
      feedback,
      strength
    };
  }

  /**
   * Get strength level based on score
   */
  private static getStrengthLevel(score: number): PasswordValidationResult['strength'] {
    if (score <= 1) return 'very-weak';
    if (score === 2) return 'weak';
    if (score === 3) return 'fair';
    if (score === 4) return 'good';
    if (score === 5) return 'strong';
    return 'very-strong';
  }

  /**
   * Get strength color for UI
   */
  static getStrengthColor(strength: PasswordValidationResult['strength']): string {
    switch (strength) {
      case 'very-weak': return '#ef4444'; // red
      case 'weak': return '#f97316'; // orange
      case 'fair': return '#eab308'; // yellow
      case 'good': return '#84cc16'; // lime
      case 'strong': return '#22c55e'; // green
      case 'very-strong': return '#10b981'; // emerald
      default: return '#6b7280'; // gray
    }
  }

  /**
   * Get strength text for UI
   */
  static getStrengthText(strength: PasswordValidationResult['strength']): string {
    switch (strength) {
      case 'very-weak': return 'Very Weak';
      case 'weak': return 'Weak';
      case 'fair': return 'Fair';
      case 'good': return 'Good';
      case 'strong': return 'Strong';
      case 'very-strong': return 'Very Strong';
      default: return 'Unknown';
    }
  }

  /**
   * Generate a strong password suggestion
   */
  static generateStrongPassword(length: number = 12): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let password = '';
    
    // Ensure at least one of each required character type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];
    
    // Fill remaining length with random characters
    const allChars = uppercase + lowercase + numbers + special;
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}

export default PasswordValidator;
