import { Budget_Type } from "@prisma/client"
import { IsEmpty, IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator"


export class AddPostDto {

    @IsString()
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
    
    hashtags?: string[]


}