import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateRideDto {
  @ApiProperty({ description: 'The name of a ride.' })
  @IsString()
  readonly name: string;

  @ApiProperty({ description: 'The brand of a ride.' })
  @IsString()
  readonly brand: string;

  @ApiProperty({ example: [] })
  @IsString({ each: true })
  readonly keywords: string[];
}