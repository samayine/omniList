import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  /**
   * Overrides Passport's handleRequest to allow anonymous access on public routes.
   * If a valid JWT is present, user is attached; otherwise, returns null instead of 401.
   */
  override handleRequest<TUser = unknown>(
    err: unknown,
    user: TUser | false,
  ): TUser | null {
    if (err) {
      if (err instanceof Error) {
        throw err;
      }
      throw new Error(typeof err === 'string' ? err : 'Authentication error');
    }
    return user || null;
  }
}
