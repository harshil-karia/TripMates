import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from "class-validator"

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
    username: string

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
    @IsString()
    @Matches(/^\d{10}$/, { message: 'Mobile number must be exactly 10 digits' })
    mobile: string
    
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