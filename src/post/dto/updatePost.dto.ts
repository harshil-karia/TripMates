import { Budget_Type, Mate_Type } from "@prisma/client"
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator"

export class UpdatePostDto {
        @IsString()
        @IsOptional()
        description?: string

        @IsOptional()
        @IsString()
        location?: string
        
        @IsOptional()
        @IsString()
        trip_duration?: string

        @IsOptional()
        @IsArray()
        @IsEnum(Mate_Type,{each: true})
        preferedMate: Mate_Type[]
        
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