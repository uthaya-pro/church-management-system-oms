import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

export class LoginDto {
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(200)
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    const user = this.authService.validateUser(loginDto.email, loginDto.password);
    return {
      success: true,
      user,
      token: 'dummy-token-for-demo',
    };
  }
}
