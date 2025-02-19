import { Between } from 'typeorm';

export class RepositoryService {
  static getBetween(start: string | number, end: string | number) {
    return Between(`${start}`, `${end}`);
  }
}
