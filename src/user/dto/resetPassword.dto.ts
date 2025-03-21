import { IsNotEmpty, IsString } from "class-validator"

export class ResetPasswordDto {
    @IsString()
    @IsNotEmpty()
    otp: string

    @IsString()
    @IsNotEmpty()
    password: string
}