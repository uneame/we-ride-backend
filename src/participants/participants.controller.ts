import { Controller, Get, Post, Query, Body, Patch, Param, Delete } from '@nestjs/common';
import { ParticipantsService } from './participants.service';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';
import { Roles } from 'src/iam/authorization/decorators/roles.decorator';
import { Role } from 'src/users/enums/role.enum';
import { Permission } from 'src/iam/authorization/permission.type';
import { Permissions } from 'src/iam/authorization/decorators/permissions.decorator';
import { FrameworkContributorPolicy } from 'src/iam/authorization/policies/framework-contributor.policy';
import { Policies } from 'src/iam/authorization/decorators/policies.decorator';
import { AuthType } from 'src/iam/authentication/enums/auth-type.enum';
import { Auth } from 'src/iam/authentication/decorators/auth.decorator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@Auth(AuthType.Bearer, AuthType.ApiKey)
@ApiTags('participants')
@Controller('participants')
export class ParticipantsController {
  constructor(private readonly participantsService: ParticipantsService) {}

  // @Roles(Role.Admin)
  // @Permissions(Permission.CreateParticipant)
  @Policies(
    new FrameworkContributorPolicy() /** new MinAgePolicy(18), new OnlyAdminPolicy() */,
  )
  @Post()
  create(@Body() createParticipantDto: CreateParticipantDto) {
    return this.participantsService.create(createParticipantDto);
  }

  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get()
  findAll(@Query() paginationQueryDto: PaginationQueryDto) {
    return this.participantsService.findAll(paginationQueryDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.participantsService.findOne(id);
  }

  // @Roles(Role.Admin)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateParticipantDto: UpdateParticipantDto) {
    return this.participantsService.update(id, updateParticipantDto);
  }

  // @Roles(Role.Admin)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.participantsService.remove(id);
  }
}
