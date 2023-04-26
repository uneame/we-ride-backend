import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateProfileDto {
  @ApiProperty({ description: 'The name of a profile.' })
  @IsString()
  readonly name: string;

  @ApiProperty({ description: 'The brand of a profile.' })
  @IsString()
  readonly brand: string;

  @ApiProperty({ example: [] })
  @IsString({ each: true })
  readonly keywords: string[];
}