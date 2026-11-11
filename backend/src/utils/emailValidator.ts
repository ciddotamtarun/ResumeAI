import dns from 'dns';

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
}

// Strict email regex: disallows special characters like *, #, $, spaces, etc.
const EMAIL_STRICT_REGEX =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/;

/**
 * Validates email syntax, disallows invalid characters (like *),
 * enforces Gmail-specific rules, and verifies domain DNS MX records.
 */
export async function validateEmail(email: string): Promise<EmailValidationResult> {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email address is required.' };
  }

  const trimmed = email.trim().toLowerCase();

  // 1. Explicit check for prohibited characters such as asterisks
  if (/[*#$!%^&()=~`[\]{}|\\:;"'<>,?/ ]/.test(trimmed)) {
    return {
      isValid: false,
      error: 'Email address contains invalid characters (such as * or spaces).',
    };
  }

  // 2. Strict syntax check
  if (!EMAIL_STRICT_REGEX.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email format (e.g. name@example.com).' };
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return { isValid: false, error: 'Invalid email address format.' };
  }

  const [username, domain] = parts;

  if (!username || !domain) {
    return { isValid: false, error: 'Email must contain both username and domain.' };
  }

  // 3. Gmail / Googlemail specific rules
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    if (username.length < 6 || username.length > 30) {
      return {
        isValid: false,
        error: 'Gmail username must be between 6 and 30 characters long.',
      };
    }
    if (!/^[a-z0-9.]+$/.test(username)) {
      return {
        isValid: false,
        error: 'Gmail username can only contain letters, numbers, and periods.',
      };
    }
    if (username.startsWith('.') || username.endsWith('.')) {
      return {
        isValid: false,
        error: 'Gmail username cannot start or end with a period.',
      };
    }
    if (username.includes('..')) {
      return {
        isValid: false,
        error: 'Gmail username cannot contain consecutive periods.',
      };
    }
  }

  // 4. DNS MX record verification (checks if domain exists and can receive mail)
  try {
    const mxRecords = await new Promise<dns.MxRecord[]>((resolve, reject) => {
      dns.resolveMx(domain, (err, addresses) => {
        if (err) return reject(err);
        resolve(addresses);
      });
    });

    if (!mxRecords || mxRecords.length === 0) {
      return {
        isValid: false,
        error: `The email domain "${domain}" does not have active mail servers.`,
      };
    }
  } catch (dnsErr: any) {
    // If MX lookup fails, attempt A record lookup as fallback
    try {
      const aRecords = await new Promise<string[]>((resolve, reject) => {
        dns.resolve4(domain, (err, addresses) => {
          if (err) return reject(err);
          resolve(addresses);
        });
      });

      if (!aRecords || aRecords.length === 0) {
        return {
          isValid: false,
          error: `The email domain "${domain}" does not exist. Please check your spelling.`,
        };
      }
    } catch {
      return {
        isValid: false,
        error: `The email domain "${domain}" does not exist or cannot receive emails.`,
      };
    }
  }

  return { isValid: true };
}
