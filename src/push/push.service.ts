import { Injectable, Logger } from '@nestjs/common';

/**
 * Envía notificaciones push a través del servicio de Expo.
 * Requiere un Expo push token (se obtiene en el móvil con un development build).
 */
@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);

  async enviar(
    token: string | null | undefined,
    titulo: string,
    cuerpo: string,
    data?: Record<string, unknown>,
  ) {
    if (!token) return;

    try {
      const resp = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          to: token,
          title: titulo,
          body: cuerpo,
          sound: 'default',
          priority: 'high',
          channelId: 'alertas',
          data: data ?? {},
        }),
      });

      if (!resp.ok) {
        this.logger.warn(`Expo push respondió ${resp.status}`);
      }
    } catch (e) {
      this.logger.warn(`No se pudo enviar la notificación push: ${String(e)}`);
    }
  }
}
