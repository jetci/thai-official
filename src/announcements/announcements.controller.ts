import { Controller, Get, Post, Body, Param, NotFoundException, UseGuards, Patch, Delete } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GetCurrentUserId } from '../common/decorators';

@Controller('announcements')
@UseGuards(RolesGuard)
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.STAFF, Role.USER, Role.VIP)
  findAll() {
    return this.announcementsService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.STAFF, Role.USER, Role.VIP)
  async findOne(@Param('id') id: string) {
    const announcement = await this.announcementsService.findOne(id);
    if (!announcement) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }
    return announcement;
  }

  @Post()
  @Roles(Role.ADMIN, Role.STAFF)
  create(
    @GetCurrentUserId() authorId: string,
    @Body() createAnnouncementDto: CreateAnnouncementDto
  ) {
    return this.announcementsService.create(createAnnouncementDto, authorId);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.STAFF)
  update(@Param('id') id: string, @Body() updateAnnouncementDto: UpdateAnnouncementDto) {
    return this.announcementsService.update(id, updateAnnouncementDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.STAFF)
  remove(@Param('id') id: string) {
    return this.announcementsService.remove(id);
  }
}
