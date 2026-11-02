import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getPlants() {
    return [
      {
        id: 1,
        name: 'Монстера',
        wateringIntervalDays: 7,
      },
      {
        id: 2,
        name: 'Кактус',
        wateringIntervalDays: 14,
      },
    ];
  }
}
