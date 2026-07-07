import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { MonitoreoService } from '../monitoreo/monitoreo.service';
import { PresenciaService } from '../presencia/presencia.service';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@WebSocketGateway({ cors: { origin: '*' } })
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private ninoIdPorSocket = new Map<string, number>();
  private usuarioPorSocket = new Map<string, JwtPayload>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly monitoreoService: MonitoreoService,
    private readonly jwtService: JwtService,
    private readonly presencia: PresenciaService,
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.auth?.token as string | undefined;
    const jwt = client.handshake.auth?.jwt as string | undefined;

    if (jwt) {
      try {
        const payload = await this.jwtService.verifyAsync<JwtPayload>(jwt);
        this.usuarioPorSocket.set(client.id, payload);
        client.emit('auth:ok', { usuario: payload });
      } catch {
        client.emit('auth:error', { mensaje: 'Sesión inválida o expirada' });
        client.disconnect(true);
      }
      return;
    }

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

    this.presencia.marcarConectado(dispositivo.ninoId);
    this.server
      .to(`nino:${dispositivo.ninoId}`)
      .emit('presencia:update', { ninoId: dispositivo.ninoId, enLinea: true });

    client.emit('auth:ok', { ninoId: dispositivo.ninoId });
  }

  handleDisconnect(client: Socket) {
    const ninoId = this.ninoIdPorSocket.get(client.id);

    if (ninoId !== undefined) {
      this.presencia.marcarDesconectado(ninoId);
      this.server
        .to(`nino:${ninoId}`)
        .emit('presencia:update', { ninoId, enLinea: false });
    }

    this.ninoIdPorSocket.delete(client.id);
    this.usuarioPorSocket.delete(client.id);
  }

  @SubscribeMessage('join-nino')
  async joinNino(client: Socket, payload: { ninoId: number }) {
    const usuario = this.usuarioPorSocket.get(client.id);

    if (!usuario) {
      client.emit('auth:error', {
        mensaje: 'Debes iniciar sesión para ver la ubicación de un niño',
      });
      return;
    }

    if (usuario.rol === 'TUTOR') {
      const nino = await this.prisma.nino.findUnique({
        where: { id: payload.ninoId },
      });

      if (!nino || nino.tutorId !== usuario.tutorId) {
        client.emit('auth:error', {
          mensaje: 'No tienes acceso a la ubicación de este niño',
        });
        return;
      }
    }

    void client.join(`nino:${payload.ninoId}`);

    // Enviar el estado de presencia actual a quien se acaba de unir
    client.emit('presencia:update', {
      ninoId: payload.ninoId,
      enLinea: this.presencia.estaConectado(payload.ninoId),
    });
  }

  @SubscribeMessage('join-codigo')
  joinCodigo(client: Socket, payload: { codigo: string }) {
    void client.join(`codigo:${payload.codigo}`);
  }

  @SubscribeMessage('posicion')
  async handlePosicion(client: Socket, payload: { lat: number; lng: number }) {
    const ninoId = this.ninoIdPorSocket.get(client.id);

    if (!ninoId) {
      client.emit('auth:error', {
        mensaje:
          'Conexión no autenticada todavía; espera el evento auth:ok antes de enviar posiciones',
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
