import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private client: jwksClient.JwksClient;

  private getClient() {
    if (!this.client) {
      this.client = jwksClient({
        jwksUri: process.env.KEYCLOAK_JWKS_URI!,
      });
    }
    return this.client;
  }

  private getKey(header: any, callback: any) {
    this.getClient().getSigningKey(header.kid, (err, key) => {
      if (err) return callback(err);
      if (!key) return callback(new Error('Signing key not found'));
      const signingKey = key.getPublicKey();
      callback(null, signingKey);
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = await new Promise((resolve, reject) => {
        jwt.verify(token, this.getKey.bind(this), { algorithms: ['RS256'] }, (err, decoded) => {
          if (err) reject(err);
          else resolve(decoded);
        });
      });

      request.user = decoded;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}