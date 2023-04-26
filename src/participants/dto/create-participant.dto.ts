import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateParticipantDto {
  @ApiProperty({ description: 'The name of a participant.' })
  @IsString()
  readonly name: string;

  @ApiProperty({ description: 'The brand of a participant.' })
  @IsString()
  readonly brand: string;

  @ApiProperty({ example: [] })
  @IsString({ each: true })
  readonly keywords: string[];
}