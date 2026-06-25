import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { MonitoreoService } from '../monitoreo/monitoreo.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private ninoIdPorSocket = new Map<string, number>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly monitoreoService: MonitoreoService,
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.auth?.token as string | undefined;

    if (!token) {
      return;
    }

    const dispositivo = await this.prisma.dispositivo.findUnique({
      where: { token },
    });

    if (!dispositivo || dispositivo.revocado) {
      client.emit('auth:error', { mensaje: 'Token de dispositivo inválido' });
      client.disconnect(true);
      return;
    }

    this.ninoIdPorSocket.set(client.id, dispositivo.ninoId);

    await this.prisma.dispositivo.update({
      where: { id: dispositivo.id },
      data: { ultimaConexion: new Date() },
    });

    client.emit('auth:ok', { ninoId: dispositivo.ninoId });
  }

  handleDisconnect(client: Socket) {
    this.ninoIdPorSocket.delete(client.id);
  }

  @SubscribeMessage('join-nino')
  joinNino(client: Socket, payload: { ninoId: number }) {
    client.join(`nino:${payload.ninoId}`);
  }

  @SubscribeMessage('join-codigo')
  joinCodigo(client: Socket, payload: { codigo: string }) {
    client.join(`codigo:${payload.codigo}`);
  }

  @SubscribeMessage('posicion')
  async handlePosicion(
    client: Socket,
    payload: { lat: number; lng: number },
  ) {
    const ninoId = this.ninoIdPorSocket.get(client.id);

    if (!ninoId) {
      client.emit('auth:error', {
        mensaje: 'Conexión no autenticada todavía; espera el evento auth:ok antes de enviar posiciones',
      });
      return;
    }

    const resultado = await this.monitoreoService.procesarPosicionAutomatica(
      ninoId,
      Number(payload.lat),
      Number(payload.lng),
    );

    this.server.to(`nino:${ninoId}`).emit('posicion:update', resultado);
  }

  emitirVinculacionCompletada(codigo: string, payload: unknown) {
    this.server.to(`codigo:${codigo}`).emit('vinculacion:completada', payload);
  }
}
