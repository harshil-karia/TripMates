import { Budget_Type } from "@prisma/client"
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator"

export class UpdatePostDto {
        @IsString()
        @IsOptional()
        description?: string
        
        @IsOptional()
        @IsString()
        trip_duration?: string
        
        @IsOptional()
        @IsEnum(Budget_Type)
        budget_type?: Budget_Type
        
        @IsOptional()
        @IsString()
        budget?: string

        @IsOptional()
        @IsString()
        startDate?: string

        @IsOptional()
        @IsString()
        endDate?: string
}