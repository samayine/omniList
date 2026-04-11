import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Status')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'API health check and info' })
  getStatus() {
    return {
      name: 'OmniList API',
      version: '1.0.0',
      status: 'ok',
      docs: '/api/docs',
    };
  }
}
