import { IsPhoneNumber, IsString } from "class-validator";

export default class CreateGymDto {
    @IsString()
    name: string;
    
    @IsString()
    location: string;

    @IsString()
    description: string;

    @IsPhoneNumber("LK")
    phone: string;
}