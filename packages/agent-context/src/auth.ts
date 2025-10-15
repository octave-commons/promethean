import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AuthToken, AuthService } from './types';
import { v4 as uuidv4 } from 'uuid';

export class JWTAuthService implements AuthService {
  private readonly jwtSecret: string;
  private readonly tokenExpiry: string;
  private revokedTokens: Set<string> = new Set();
  private rateLimitMap: Map<string, { count: number; resetTime: number }> = new Map();
  private readonly rateLimitWindow: number = 60000; // 1 minute
  private readonly maxAttempts: number = 3; // 3 attempts

  constructor(
    configOrSecret?:
      | string
      | {
          jwtSecret?: string;
          tokenExpiry?: string;
          rateLimitWindow?: number;
          maxAttempts?: number;
        },
    tokenExpiry: string = '24h',
  ) {
    // Get JWT secret from config or environment variable
    let jwtSecret: string | undefined;
    if (typeof configOrSecret === 'string') {
      jwtSecret = configOrSecret || process.env.JWT_SECRET;
      this.tokenExpiry = tokenExpiry;
    } else {
      jwtSecret = configOrSecret?.jwtSecret || process.env.JWT_SECRET;
      this.tokenExpiry = configOrSecret?.tokenExpiry || tokenExpiry;
    }

    // Enforce JWT secret requirement - no default fallback for security
    if (!jwtSecret) {
      throw new Error(
        'JWT_SECRET is required. Set it as an environment variable or pass it in the config. ' +
          'Using a default secret would be a security vulnerability.',
      );
    }

    // Validate secret strength
    if (jwtSecret.length < 32) {
      throw new Error(
        'JWT_SECRET must be at least 32 characters long for security. ' +
          `Current length: ${jwtSecret.length}`,
      );
    }

    this.jwtSecret = jwtSecret;
  }

  async generateToken(agentId: string, permissions: string[]): Promise<AuthToken> {
    const tokenId = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours from now

    const payload = {
      tokenId,
      agentId,
      permissions,
      type: 'agent-auth',
    };

    const token = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.tokenExpiry,
      issuer: 'promethean-agent-os',
      audience: 'promethean-agents',
    } as jwt.SignOptions);

    return {
      token,
      agentId,
      expiresAt,
      permissions,
    };
  }

  async validateToken(token: string): Promise<AuthToken | null> {
    try {
      // Check rate limiting
      const now = Date.now();
      const key = `validate:${token.substring(0, 10)}`; // Use first 10 chars as key

      if (this.rateLimitMap.has(key)) {
        const record = this.rateLimitMap.get(key)!;
        if (now - record.resetTime < this.rateLimitWindow) {
          if (record.count >= this.maxAttempts) {
            throw new Error('Rate limit exceeded');
          }
          record.count++;
        } else {
          // Reset the window
          this.rateLimitMap.set(key, { count: 1, resetTime: now });
        }
      } else {
        this.rateLimitMap.set(key, { count: 1, resetTime: now });
      }

      // Check if token is revoked
      if (this.revokedTokens.has(token)) {
        return null;
      }

      const decoded = jwt.verify(token, this.jwtSecret, {
        issuer: 'promethean-agent-os',
        audience: 'promethean-agents',
      }) as any;

      if (decoded.type !== 'agent-auth') {
        return null;
      }

      return {
        token,
        agentId: decoded.agentId,
        expiresAt: new Date(decoded.exp * 1000),
        permissions: decoded.permissions,
      };
    } catch (error) {
      if (error instanceof Error && error.message === 'Rate limit exceeded') {
        throw error;
      }
      return null;
    }
  }

  async revokeToken(token: string): Promise<void> {
    // Add token to revoked list
    this.revokedTokens.add(token);
  }

  async refreshToken(oldToken: string): Promise<AuthToken> {
    const validated = await this.validateToken(oldToken);
    if (!validated) {
      throw new Error('Cannot refresh invalid token');
    }

    return this.generateToken(validated.agentId, validated.permissions);
  }

  hasPermission(token: string, permission: string): boolean {
    try {
      const decoded = jwt.verify(token, this.jwtSecret, {
        issuer: 'promethean-agent-os',
        audience: 'promethean-agents',
      }) as any;

      return decoded.permissions && decoded.permissions.includes(permission);
    } catch (error) {
      return false;
    }
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Alias for verifyPassword to match test expectations
  async validatePassword(password: string, hash: string): Promise<boolean> {
    return this.verifyPassword(password, hash);
  }

  generateApiKey(agentId: string): string {
    const payload = {
      agentId,
      type: 'api-key',
      timestamp: Date.now(),
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: '1y',
      issuer: 'promethean-agent-os',
    });
  }

  async validateApiKey(apiKey: string): Promise<string | null> {
    try {
      const decoded = jwt.verify(apiKey, this.jwtSecret, {
        issuer: 'promethean-agent-os',
      }) as any;

      if (decoded.type !== 'api-key') {
        return null;
      }

      return decoded.agentId;
    } catch (error) {
      return null;
    }
  }
}
