import { Controller, Get, Post, Query, Body, Patch, Param, Delete } from '@nestjs/common';
import { CoffeesService } from './coffees.service';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
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
@ApiTags('coffees')
@Controller('coffees')
export class CoffeesController {
  constructor(private readonly coffeesService: CoffeesService) {}

  // @Roles(Role.Admin)
  // @Permissions(Permission.CreateCoffee)
  @Policies(
    new FrameworkContributorPolicy() /** new MinAgePolicy(18), new OnlyAdminPolicy() */,
  )
  @Post()
  create(@Body() createCoffeeDto: CreateCoffeeDto) {
    return this.coffeesService.create(createCoffeeDto);
  }

  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get()
  findAll(@Query() paginationQueryDto: PaginationQueryDto) {
    return this.coffeesService.findAll(paginationQueryDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coffeesService.findOne(id);
  }

  // @Roles(Role.Admin)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCoffeeDto: UpdateCoffeeDto) {
    return this.coffeesService.update(id, updateCoffeeDto);
  }

  // @Roles(Role.Admin)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coffeesService.remove(id);
  }
}
