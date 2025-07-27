import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Req, 
  UploadedFile, 
  UseInterceptors, 
  BadRequestException 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as crypto from 'crypto';

import { ChallengesService } from './challenges.service.js';
import { CreateChallengeDto } from './dto/create-challenge.dto.js';
import { UpdateChallengeDto } from './dto/update-challenge.dto.js';
import { ReviewChallengeDto } from './dto/review-challenge.dto.js';
import { AdminGuard } from '../auth/admin.guard.js';

@Controller('challenges')
export class ChallengesController {
  constructor(private readonly challengesService: ChallengesService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('screenshot', {
      storage: diskStorage({
        destination: './uploads/challenges',
        filename: (req, file, cb) => {
          const randomName = crypto.randomBytes(16).toString('hex');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(new BadRequestException('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async create(
    @Req() req,
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    console.log('Challenge creation request received:', {
      userId: req.user?.id,
      body,
      file: file ? { filename: file.filename, size: file.size } : null
    });

    const userId = parseInt(req.user.id, 10);
    if (isNaN(userId)) {
      throw new BadRequestException('Invalid user ID.');
    }

    // Manual validation since FormData doesn't work well with ValidationPipe
    if (!body.description || typeof body.description !== 'string') {
      throw new BadRequestException('Description is required and must be a string');
    }

    if (body.description.length < 10) {
      throw new BadRequestException('Challenge description must be at least 10 characters long');
    }

    const createChallengeDto: CreateChallengeDto = {
      description: body.description,
    };
    
    const screenshotPath = file ? file.path.replace(/\\/g, '/') : undefined;
    
    return this.challengesService.create(userId, createChallengeDto, screenshotPath);
  }

  @Post('test')
  @UseGuards(AuthGuard('jwt'))
  async createTest(
    @Req() req,
    @Body() body: any,
  ) {
    console.log('Test endpoint hit:', {
      userId: req.user?.id,
      body: body,
      bodyKeys: Object.keys(body),
      description: body.description,
      descriptionType: typeof body.description,
    });

    return {
      message: 'Test endpoint works',
      receivedData: body,
      userId: req.user?.id,
    };
  }

  @Post('simple')
  @UseGuards(AuthGuard('jwt'))
  async createSimple(
    @Req() req,
    @Body() body: any,
  ) {
    console.log('Simple challenge creation:', {
      userId: req.user?.id,
      body,
      description: body.description,
    });

    const userId = parseInt(req.user.id, 10);
    if (isNaN(userId)) {
      throw new BadRequestException('Invalid user ID.');
    }

    if (!body.description || typeof body.description !== 'string') {
      throw new BadRequestException('Description is required and must be a string');
    }

    if (body.description.length < 10) {
      throw new BadRequestException('Challenge description must be at least 10 characters long');
    }

    const createChallengeDto: CreateChallengeDto = {
      description: body.description,
    };
    
    return this.challengesService.create(userId, createChallengeDto, undefined);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  async findAll() {
    return this.challengesService.findAll();
  }

  @Get('pending')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  async findPending() {
    return this.challengesService.findPendingChallenges();
  }

  @Get('my-challenges')
  @UseGuards(AuthGuard('jwt'))
  async findMyCharlenges(@Req() req) {
    const userId = parseInt(req.user.id, 10);
    return this.challengesService.findAllByUser(userId);
  }

  @Get('access-check')
  @UseGuards(AuthGuard('jwt'))
  async checkAccess(@Req() req) {
    const userId = parseInt(req.user.id, 10);
    const hasAccess = await this.challengesService.checkUserAccess(userId);
    return { hasAccess };
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Param('id') id: string, @Req() req) {
    const challenge = await this.challengesService.findOne(id);
    
    // Users can only view their own challenges, admins can view all
    if (req.user.role !== 'admin' && challenge.userId !== parseInt(req.user.id, 10)) {
      throw new BadRequestException('You can only view your own challenges');
    }
    
    return challenge;
  }

  @Post(':id/review')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  async review(
    @Param('id') id: string,
    @Body() reviewData: ReviewChallengeDto,
    @Req() req,
  ) {
    return this.challengesService.review(id, req.user.id, reviewData);
  }

  @Post(':id/link-subscription')
  @UseGuards(AuthGuard('jwt'))
  async linkSubscription(
    @Param('id') id: string,
    @Body() data: { subscriptionId: string },
    @Req() req,
  ) {
    const challenge = await this.challengesService.findOne(id);
    
    // Users can only link their own challenges
    if (challenge.userId !== parseInt(req.user.id, 10)) {
      throw new BadRequestException('You can only link your own challenges');
    }
    
    return this.challengesService.linkSubscription(id, data.subscriptionId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id') id: string,
    @Body() updateChallengeDto: UpdateChallengeDto,
    @Req() req,
  ) {
    const challenge = await this.challengesService.findOne(id);
    
    if (req.user.role === 'admin') {
      return this.challengesService.update(id, updateChallengeDto);
    }
    
    // Users can only update their own challenges and only certain fields
    if (challenge.userId !== parseInt(req.user.id, 10)) {
      throw new BadRequestException('You can only update your own challenges');
    }
    
    // Remove admin-only fields for non-admin users
    const { status, adminNotes, googleMeetLink, ...allowedUpdates } = updateChallengeDto;
    
    return this.challengesService.update(id, allowedUpdates);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(@Param('id') id: string, @Req() req) {
    const challenge = await this.challengesService.findOne(id);
    
    if (req.user.role !== 'admin' && challenge.userId !== parseInt(req.user.id, 10)) {
      throw new BadRequestException('You can only delete your own challenges');
    }
    
    return this.challengesService.remove(id);
  }
} 