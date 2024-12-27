import { IsDate, IsEmail, IsEmpty, IsNotEmpty, IsNotIn, IsNumber, IsOptional, IsString } from "class-validator"

enum Gender {
    MALE,
    FEMALE,
    OTHER,
}

enum Rating {
    ONE,
    TWO,
    THREE,
    FOUR,
    FIVE,
}

export class SignUpDto{
    @IsNotEmpty()
    @IsString()
    userName: string

    @IsEmail()
    @IsNotEmpty()
    email: string

    @IsNotEmpty()
    @IsString()
    password: string

    @IsNotEmpty()
    @IsString()
    firstName: string

    @IsNotEmpty()
    @IsString()
    lastName: string

    @IsNotEmpty()
    gender: Gender

    @IsNotEmpty()
    @IsNumber()
    mobile: number
    
    @IsNotEmpty()
    @IsString()
    location: string

    @IsOptional()
    bio?: string|null

    @IsOptional()
    rating?: Rating|null

    @IsOptional()
    dob?: Date|null
    social_links: string[]
}