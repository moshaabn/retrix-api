import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { GetUser } from './decorator';
import { LoginDto, SignupDto } from './dto';
import { JwtGuard } from './guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('/signup')
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('/login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('/me')
  @UseGuards(JwtGuard)
  getCurrentUser(@GetUser() user: User) {
    return user;
  }
}
