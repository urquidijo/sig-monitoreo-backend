import { Test, TestingModule } from '@nestjs/testing';
import { AlertasService } from './alertas.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AlertasService', () => {
  let service: AlertasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AlertasService, { provide: PrismaService, useValue: {} }],
    }).compile();

    service = module.get<AlertasService>(AlertasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
