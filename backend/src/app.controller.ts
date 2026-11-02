import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';

@Controller('plants')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getPlants() {
    return this.appService.getPlants();
  }
}
