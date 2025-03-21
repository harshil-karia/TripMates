import { Budget_Type, Mate_Type } from "@prisma/client"
import { IsArray, IsEmpty, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"


export class AddPostDto {

    @IsString()
    @IsOptional()
    description?: string

    @IsString()
    @IsNotEmpty()
    trip_duration: string

    @IsEnum(Budget_Type)
    @IsNotEmpty()
    budget_type: Budget_Type

    @IsNotEmpty()
    @IsString()
    budget: string

    @IsString()
    @IsNotEmpty()
    location: string

    @IsArray()
    @IsNotEmpty()
    @IsEnum(Mate_Type,{each: true})
    preferedMate: Mate_Type[]
    
    @IsArray()
    @IsOptional()
    @IsString({each: true})
    hashtags?: string[]

    @IsString()
    @IsOptional()
    startDate: string

    @IsString()
    @IsOptional()
    endDate: string
}