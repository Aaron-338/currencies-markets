import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Request, Get, Headers } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { CreateUserDto, LoginUserDto } from './dto/auth.dto.js';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Headers('authorization') authHeader: string) {
    await this.authService.logout(authHeader);
    return { message: 'Successfully logged out' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshTokens(refreshToken);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('sessions')
  async getSessions(@Request() req) {
    return this.authService.getUserSessions(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('sessions/revoke')
  async revokeSession(
    @Request() req,
    @Body('sessionId') sessionId: string
  ) {
    return this.authService.revokeSession(req.user.id, sessionId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('sessions/revoke-all')
  async revokeAllSessions(@Request() req) {
    return this.authService.revokeAllSessions(req.user.id);
  }
}
