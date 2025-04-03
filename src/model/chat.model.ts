import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type ChatDocument = HydratedDocument<Chat>;

@Schema({timestamps: true})
export class Chat {
    @Prop({required: true})
    senderId: string

    @Prop({required: true})
    receiverId: string

    @Prop({required: true})
    message: string

    @Prop({required: true,default: false})
    isRead: boolean
}

export const ChatSchema = SchemaFactory.createForClass(Chat);