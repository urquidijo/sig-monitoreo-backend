import { Test, TestingModule } from '@nestjs/testing';
import { AlertasController } from './alertas.controller';
import { AlertasService } from './alertas.service';

describe('AlertasController', () => {
  let controller: AlertasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlertasController],
      providers: [
        {
          provide: AlertasService,
          useValue: {
            listar: jest.fn(),
            obtener: jest.fn(),
            marcarAtendida: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AlertasController>(AlertasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
