import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: '/import',
  cors: {
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class ImportGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    console.log('🟢 ImportGateway initialized');

    server.on('connection', (socket: Socket) => {
      console.log(`⚡ Client connected: ${socket.id}`);
      socket.on('disconnect', (reason) =>
        console.log(`❌ Client disconnected: ${socket.id}, reason=${reason}`)
      );
    });
  }

  @SubscribeMessage('join')
  handleJoin(client: Socket, importId: string) {
    client.join(importId);
    client.emit('joined', { importId });
    console.log(`📌 Client ${client.id} joined room: ${importId}`);
  }

  sendProgress(
    importId: string,
    importedCount: number,
    failedCount: number,
    total: number,
    status: 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'PARTIAL' = 'PROCESSING',
  ) {
    const progress = total ? ((importedCount + failedCount) / total) * 100 : 0;
    this.server.to(importId).emit('progress', {
      importId,
      importedCount,
      failedCount,
      total,
      progress: Math.round(progress),
      status,
    });

    console.log(
      `📊 Progress for importId=${importId}: ${importedCount}/${total} imported, ${failedCount} failed, status=${status}`,
    );
  }

  sendCompleted(importId: string, summary: any) {
    this.server.to(importId).emit('completed', summary);
    console.log(`✅ Import completed for importId=${importId}`);
  }
}
