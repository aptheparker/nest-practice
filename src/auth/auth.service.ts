import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username, pass) {
    const user = await this.usersService.findUserByUsername(username);

    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }

    return user;
  }

  async generateAccessToken(user) {
    const payload = { sub: user.userId, username: user.username };

    return this.jwtService.signAsync(payload);
  }

  async generateRefreshToken(user) {
    const payload = { sub: user.userId, username: user.username };

    return this.jwtService.signAsync(payload);
  }

  async refresh(refreshTokenDto): Promise<string> {
    const { refresh_token } = refreshTokenDto;
    const decodedRefreshToken = this.jwtService.verify(refresh_token, { secret: process.env.JWT_REFRESH_SECRET });

    const userId = decodedRefreshToken.sub;
    const user = await this.usersService.findUserByUserId(userId);
    if (!user) {
      throw new UnauthorizedException('Invalid user!');
    }

    const accessToken = await this.generateAccessToken(user);
    return accessToken;
  }
}
