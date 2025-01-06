import { IsArray, IsDate, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from "class-validator"

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

export class UpdateUserDto{

    @IsOptional()
    @IsString()
    username?: string

    @IsDate()
    @IsOptional()
    updatedAt?: Date

    @IsOptional()
    @IsEmail()
    email?: string

    @IsOptional()
    @IsString()
    firstName?: string

    @IsOptional()
    @IsString()
    lastName?: string

    @IsOptional()
    @IsEnum(Gender)
    gender?: Gender

    @IsOptional()
    @IsString()
    @Matches(/^\d{10}$/, { message: 'Mobile number must be exactly 10 digits' })
    mobile?: string
    
    @IsOptional()
    @IsString()
    location?: string

    @IsOptional()
    bio?: string|null

    @IsOptional()
    @IsEnum(Rating)
    rating?: Rating|null

    @IsOptional()
    @IsDate()
    dob?: Date|null

    @IsOptional()
    @IsArray()
    @IsString({each: true})
    social_links: string[]
}