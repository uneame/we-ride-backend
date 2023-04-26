import { Controller, Get, Post, Query, Body, Patch, Param, Delete } from '@nestjs/common';
import { RidesService } from './rides.service';
import { CreateRideDto } from './dto/create-ride.dto';
import { UpdateRideDto } from './dto/update-ride.dto';
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
@ApiTags('rides')
@Controller('rides')
export class RidesController {
  constructor(private readonly ridesService: RidesService) {}

  // @Roles(Role.Admin)
  // @Permissions(Permission.CreateRide)
  @Policies(
    new FrameworkContributorPolicy() /** new MinAgePolicy(18), new OnlyAdminPolicy() */,
  )
  @Post()
  create(@Body() createRideDto: CreateRideDto) {
    return this.ridesService.create(createRideDto);
  }

  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get()
  findAll(@Query() paginationQueryDto: PaginationQueryDto) {
    return this.ridesService.findAll(paginationQueryDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ridesService.findOne(id);
  }

  // @Roles(Role.Admin)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRideDto: UpdateRideDto) {
    return this.ridesService.update(id, updateRideDto);
  }

  // @Roles(Role.Admin)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ridesService.remove(id);
  }
}
