import { Budget_Type } from "@prisma/client"
import { IsEnum, IsNotEmpty, IsString } from "class-validator"

export class UpdatePostDto {
        @IsString()
        description?: string
    
        @IsString()
        trip_duration?: string
    
        @IsEnum(Budget_Type)
        budget_type?: Budget_Type

        @IsString()
        budget?: string
}