import { Injectable } from '@nestjs/common';

/**
 * Mantiene en memoria qué niños tienen su dispositivo transmitiendo ahora
 * mismo (socket conectado). Lo escribe el gateway de realtime y lo lee el
 * servicio de monitoreo para el panel del admin, sin dependencias circulares.
 */
@Injectable()
export class PresenciaService {
  private readonly conectados = new Set<number>();

  marcarConectado(ninoId: number) {
    this.conectados.add(ninoId);
  }

  marcarDesconectado(ninoId: number) {
    this.conectados.delete(ninoId);
  }

  estaConectado(ninoId: number) {
    return this.conectados.has(ninoId);
  }

  listar(): number[] {
    return [...this.conectados];
  }
}
