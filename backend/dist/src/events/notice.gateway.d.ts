import { Server, Socket } from 'socket.io';
export declare class NoticeGateway {
    server: Server;
    handleJoin(socket: Socket, userId: string): void;
    sendNotice(userId: string, notice: any): void;
}
