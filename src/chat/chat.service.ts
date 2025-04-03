import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AuthService } from "src/auth/auth.service";
import { Chat, ChatDocument } from "src/model/chat.model";
import { PrismaService } from "src/prisma/prisma.service";


@Injectable()
export class ChatService {
    constructor(
        @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
        private prisma: PrismaService,
        private auth: AuthService
    ) {}

    async createMessage(senderId: string, receiverId: string, message: string) {
        const newMessage = new this.chatModel({ senderId, receiverId, message, isRead: false });
        return newMessage.save();
    }

    async getChatHistory(userId1: number, userId2: string) {
        const chatHistory = await this.chatModel
            .find({
                $or: [
                    { senderId: userId1+"", receiverId: userId2 },
                    { senderId: userId2, receiverId: userId1+"" },
                ],
            })
            .sort({ createdAt: 1 });
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId1
            }
        })
        const tokens = await this.auth.getTokens(userId1,user.email);
        return {
            access_token: tokens.access_token,
            history: chatHistory
        }
        
    }

    async getUnreadMessages(userId: string) {
        return this.chatModel.find({ receiverId: userId, isRead: false }).sort({ createdAt: 1 });
    }

    async markMessagesAsRead(userId: string) {
        return this.chatModel.updateMany({ receiverId: userId, isRead: false }, { isRead: true });
    }
    async getChatList(userId: number) {
        console.log(userId);
        const list = await this.chatModel.find({
            $or: [
                {senderId: userId+""},
                {receiverId: userId+""},
            ]
        })
        console.log(list);
        const uids = new Set();
        list.forEach(({ senderId, receiverId }) => {
            uids.add(senderId);
            uids.add(receiverId);
        });
        const idList = Array.from(uids);
        const filteredIds = idList.filter(id => id != userId);
        console.log(filteredIds);
        const numericIds: number[] = filteredIds.map(Number);
        const users = await this.prisma.user.findMany({
            where: {
              id: {
                in: numericIds,
              },
            },
            select: {
                firstName: true,
                lastName: true,
                username: true,
                images: {
                    select: {
                        imageType: true,
                        url: true
                    }
                },
                id: true,     
            }
          });
        console.log(users);
        const currentUser = await this.prisma.user.findUnique({
            where: {
                id: userId
            }
        });
        const tokens = await this.auth.getTokens(userId,currentUser.email);
        return {
            access_token: tokens.access_token,
            users
        }
    }
}
