import { MessageEnvelope } from '../types';
import crypto from 'crypto';

export class MessageSigner {
  static signMessage(
    envelope: MessageEnvelope,
    secretKey: string
  ): MessageEnvelope {
    const messageData = {
      id: envelope.id,
      type: envelope.type,
      sender: envelope.sender,
      recipient: envelope.recipient,
      timestamp: envelope.timestamp.toISOString(),
      payload: envelope.payload,
    };

    const messageString = JSON.stringify(messageData);
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(messageString)
      .digest('hex');

    return {
      ...envelope,
      signature,
    };
  }

  static verifySignature(
    envelope: MessageEnvelope,
    publicKey: string
  ): boolean {
    if (!envelope.signature) {
      return false;
    }

    try {
      const messageData = {
        id: envelope.id,
        type: envelope.type,
        sender: envelope.sender,
        recipient: envelope.recipient,
        timestamp: envelope.timestamp.toISOString(),
        payload: envelope.payload,
      };

      const messageString = JSON.stringify(messageData);
      const expectedSignature = crypto
        .createHmac('sha256', publicKey)
        .update(messageString)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(envelope.signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch (error) {
      return false;
    }
  }

  static generateKeyPair(): { publicKey: string; privateKey: string } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    return { publicKey, privateKey };
  }
}
