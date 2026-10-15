import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getStatus() {
    return {
      name: 'OmniList API',
      version: '1.0.0',
      status: 'ok',
      docs: '/api/docs',
    };
  }
}
