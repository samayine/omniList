import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Override handleRequest so it doesn't throw if no token is provided
  handleRequest(err: any, user: any, info: any) {
    if (err) {
      throw err;
    }
    // If no user was extracted (e.g. no token, invalid token), return null instead of throwing UnauthorizedException
    return user || null;
  }
}
