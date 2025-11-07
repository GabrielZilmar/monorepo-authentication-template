import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { RegisterDto, LoginDto, AuthResponseDto } from '@repo/api';
import { UsersService } from '~/modules/users/users.service';
import { User } from '~/modules/users/entities/user.entity';
import PasswordUtils from '~/shared/password.util';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, username, passwordConfirm } = registerDto;

    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new UnauthorizedException('User with this email already exists');
    }

    // Create user (UsersService handles password hashing)
    const user = await this.usersService.create({
      email,
      password,
      username,
      passwordConfirm,
    });

    // Generate JWT token
    const payload = { sub: user.id, email: user.email };
    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await PasswordUtils.compare({
      password,
      passwordHashed: user.password,
    });
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = { sub: user.id, email: user.email };
    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;

    const isPasswordValid = await PasswordUtils.compare({
      password,
      passwordHashed: user.password,
    });
    if (!isPasswordValid) return null;

    const { password: _p, ...result } = user;
    return result;
  }

  async findById(id: string): Promise<User> {
    return this.usersService.findById(id);
  }
}
