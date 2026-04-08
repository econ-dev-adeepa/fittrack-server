import { IsNumber, IsOptional, IsPhoneNumber, IsString } from "class-validator";

export default class CreateGymDto {
    @IsString()
    name: string;
    
    @IsString()
    location: string;

    @IsString()
    description: string;

    @IsPhoneNumber("LK")
    phone: string;

    @IsString()
    @IsOptional()
    operationalDays?: string;

    @IsString()
    @IsOptional()
    openTime?: string;

    @IsString()
    @IsOptional()
    closeTime?: string;

    @IsNumber()
    @IsOptional()
    capacity?: number;
}