import { 
    WebSocketGateway, WebSocketServer, SubscribeMessage, 
    ConnectedSocket, MessageBody, OnGatewayConnection, 
    OnGatewayDisconnect 
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ChatService } from "./chat.service";
import { RegisterUserDto, SendMessageDto } from "./dto";

@WebSocketGateway(3002, { cors: { origin: "*" } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private users: Record<string, string> = {};

    constructor(private chatService: ChatService) {}

    handleConnection(@ConnectedSocket() socket: Socket) {
        console.log(` User connected: ${socket.id}`);
    }

    // When a user disconnects, remove them from online users
    handleDisconnect(@ConnectedSocket() socket: Socket) {
        const userId = Object.keys(this.users).find((key) => this.users[key] === socket.id);
        if (userId) {
            delete this.users[userId];
            this.server.emit("updateOnlineUsers", Object.keys(this.users)); // Notify clients
            console.log(` User disconnected: ${userId}`);
        }
    }

    // Register user and store their socket ID
    @SubscribeMessage("registerUser")
    async registerUser(@MessageBody() data: any, @ConnectedSocket() socket: Socket) {
    console.log("🔹 Received registerUser event with data:", data);
    const jsonData = JSON.parse(data);
    console.log(jsonData);
    console.log(jsonData.userId);
    const userId = jsonData?.userId;
    console.log("User Id",userId)

    if (!userId) {
        console.error(" Error: userId is missing!");
        socket.emit("error", { message: "userId is required" });
        return;
    }

    this.users[jsonData.userId] = socket.id;
    console.log(` User registered successfully: ${jsonData.userId}`);

    // Send updated online users list
    this.server.emit("updateOnlineUsers", Object.keys(this.users));
}


    // Handle message sending and real-time delivery
    @SubscribeMessage("sendMessage")
    async sendMessage(@MessageBody() sendMessageDto: any, @ConnectedSocket() socket: Socket) {
        const jsonData = JSON.parse(sendMessageDto)
        const { senderId, receiverId, message } = jsonData;

        // Save message in database (as unread by default)
        const savedMessage = await this.chatService.createMessage(senderId, receiverId, message);

        //  Deliver message in real-time if receiver is online
        if (this.users[receiverId]) {
            this.server.to(this.users[receiverId]).emit("receiveMessage", savedMessage.message);
            console.log(` Message sent to ${receiverId}`);
        } else {
            console.log(` User ${receiverId} is offline. Message saved.`);
        }

        // Emit confirmation to sender
        socket.emit("messageSent", savedMessage);
    }
}
