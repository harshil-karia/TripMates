import { IsEmail, IsNotEmpty, IsString } from "class-validator"

export class UpdatePasswordDto{
    @IsEmail()
    @IsNotEmpty()
    email: string

    @IsNotEmpty()
    @IsString()
    password: string
}