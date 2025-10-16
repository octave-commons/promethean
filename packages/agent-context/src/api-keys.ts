import jwt from 'jsonwebtoken';
import { AuthToken } from './types';
import { SecurityValidator, SecurityLogger } from './security';

export class ApiKeyManager {
  constructor(private readonly jwtSecret: string) {}

  generateApiKey(agentId: string, permissions: string[]): string {
    const validatedAgentId = SecurityValidator.validateAgentId(agentId);
    const validatedPermissions = SecurityValidator.validatePermissions(permissions);

    const payload = {
      agentId: validatedAgentId,
      permissions: validatedPermissions,
      type: 'api-key',
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: '1y',
      issuer: 'promethean-agent-os',
      audience: 'promethean-agents',
    } as jwt.SignOptions);
  }

  async validateApiKey(apiKey: string): Promise<AuthToken | null> {
    try {
      const validatedApiKey = SecurityValidator.validateToken(apiKey);

      const decoded = jwt.verify(validatedApiKey, this.jwtSecret, {
        issuer: 'promethean-agent-os',
        audience: 'promethean-agents',
      }) as jwt.JwtPayload;

      if (decoded.type !== 'api-key') {
        return null;
      }

      return {
        token: validatedApiKey,
        agentId: decoded.agentId as string,
        expiresAt: new Date((decoded.exp as number) * 1000),
        permissions: decoded.permissions as string[],
      };
    } catch {
      return null;
    }
  }
}
