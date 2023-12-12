import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Request,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto, @Res({ passthrough: true }) res): Promise<any> {
    const user = await this.authService.validateUser(
      loginDto.username,
      loginDto.password,
    );

    const access_token = await this.authService.generateAccessToken(user);
    const refresh_token = await this.authService.generateRefreshToken(user);

    res.setHeader('Authorization', 'Bearer ' + [access_token, refresh_token]);
    res.cookie('access_token', access_token, {
      httpOnly: true,
    });
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
    });
    return {
      message: 'login success',
      access_token: access_token,
      refresh_token: refresh_token,
    };
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('refresh')
  async refresh(@Body() refreshTokenDto, @Res({ passthrough: true }) res) {
    const newAccessToken = (await this.authService.refresh(refreshTokenDto))
      .accessToken;
    res.setHeader('Authorization', 'Bearer ' + newAccessToken);
    res.cookie('access_token', newAccessToken, {
      httpOnly: true,
    });
    res.send({ newAccessToken });
  }
}
