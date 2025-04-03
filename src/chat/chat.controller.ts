import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { SendMessageDto } from "./dto";
import { GetCurrentUserId } from "src/auth/common/decorator";

@Controller("chat")
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Post("send")
    async sendMessage(@Body() sendMessageDto: SendMessageDto) {
        return this.chatService.createMessage(sendMessageDto.senderId, sendMessageDto.receiverId, sendMessageDto.message);
    }

    @Get("history/:userId2")
    async getChatHistory(@GetCurrentUserId() userId1: number, @Param("userId2") userId2: string) {
        return this.chatService.getChatHistory(userId1, userId2);
    }

    @Get("unread/:userId")
    async getUnreadMessages(@Param("userId") userId: string) {
        return this.chatService.getUnreadMessages(userId);
    }

    @Get("chatList")
    async getChatList(@GetCurrentUserId() userId:number) {
        return this.chatService.getChatList(userId);
    }
}
