import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

interface JwtPayload {
  otp: string;
  userEmail: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class OtpAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ForbiddenException('No token provided');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = await this.jwtService.verifyAsync<JwtPayload>(token, { secret: 'otp-secret' });

      console.log("Decoded Token:", decoded); // Debugging step
      request.user = decoded; // Attach decoded JWT payload to request.user
      return true;
    } catch (error) {
      throw new ForbiddenException('Invalid or expired OTP token');
    }
  }
}
