import { IsBoolean, IsNotEmpty, IsString } from "class-validator"

export class SettingsUpdationDto {
    @IsBoolean()
    @IsNotEmpty()
    likeCommentNotifications: boolean

    @IsBoolean()
    @IsNotEmpty()
    chatNotifications: boolean

    @IsBoolean()
    @IsNotEmpty()
    recommendedNotifications: boolean
}