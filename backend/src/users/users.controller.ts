import { Controller, Get, Post, Body, Param, Delete, NotFoundException, UseGuards, Req, Patch, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UsersService } from './users.service.js';
import { User } from './user.entity.js';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { Express } from 'express';
import { UpdatePermissionsDto } from './dto/update-permissions.dto.js';
import { AdminGuard } from '../auth/admin.guard.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Req() req: Request) {
    return req.user;
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('profile')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads/avatars',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      console.log('File upload attempt:', {
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      });
      
      // Allow image files only
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        console.log('File rejected: Invalid mimetype', file.mimetype);
        return cb(new Error('Only image files (JPG, JPEG, PNG, GIF, WebP) are allowed!'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  }))
  updateProfile(
    @Req() req: any,
    @Body() updateProfileDto: UpdateProfileDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log('Profile update request:', {
      userId: req.user?.id,
      hasFile: !!file,
      fileName: file?.filename,
      body: updateProfileDto,
    });
    
    if (file) {
      updateProfileDto.image = `/uploads/avatars/${file.filename}`;
    }
    
    return this.usersService.update(req.user.id, updateProfileDto);
  }

  @Post()
  create(@Body() user: User): Promise<User> {
    return this.usersService.create(user);
  }

  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<User> {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    return user;
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.usersService.remove(id);
  }

  @Patch(':id/permissions')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  updatePermissions(
    @Param('id') id: number,
    @Body() updatePermissionsDto: UpdatePermissionsDto,
  ): Promise<User> {
    return this.usersService.updatePermissions(id, updatePermissionsDto);
  }
}
