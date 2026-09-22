import { Server, Socket } from 'socket.io';
export declare class EventsGateway {
    server: Server;
    private clientSocket;
    constructor();
    sendAndReceive(event: string, data: any): Promise<any>;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
}
