import { IsNotEmpty, IsString } from "class-validator"

export class SendMessageDto {
    @IsNotEmpty()
    @IsString()
    receiverId: string;

    @IsNotEmpty()
    @IsString()
    senderId: string;

    @IsNotEmpty()
    @IsString()
    message: string;
}