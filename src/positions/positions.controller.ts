import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PositionsService } from './positions.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Positions')
@ApiBearerAuth()
@Controller('positions')
@UseGuards(JwtAuthGuard)
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new position (Admin only)' })
  @ApiResponse({ status: 201, description: 'The position has been successfully created.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires ADMIN role.' })
  create(@Body() createPositionDto: CreatePositionDto) {
    return this.positionsService.create(createPositionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all positions' })
  @ApiResponse({ status: 200, description: 'Return all positions.' })
  findAll() {
    return this.positionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a position by ID' })
  @ApiResponse({ status: 200, description: 'Return the position.' })
  @ApiResponse({ status: 404, description: 'Position not found.' })
  findOne(@Param('id') id: string) {
    return this.positionsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a position (Admin only)' })
  @ApiResponse({ status: 200, description: 'The position has been successfully updated.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires ADMIN role.' })
  @ApiResponse({ status: 404, description: 'Position not found.' })
  update(@Param('id') id: string, @Body() updatePositionDto: UpdatePositionDto) {
    return this.positionsService.update(id, updatePositionDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a position (Admin only)' })
  @ApiResponse({ status: 200, description: 'The position has been successfully deleted.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires ADMIN role.' })
  @ApiResponse({ status: 404, description: 'Position not found.' })
  remove(@Param('id') id: string) {
    return this.positionsService.remove(id);
  }
}
