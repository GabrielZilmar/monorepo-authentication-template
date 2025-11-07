import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { LoginDto, AuthResponseDTO, RegisterUserDTO } from '@repo/api';
import { UsersService } from '~/modules/users/users.service';
import { User } from '~/modules/users/entities/user.entity';
import PasswordUtils from '~/shared/password.util';
import UserRepository from '~/services/database/typeorm/repositories/user.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly userRepository: UserRepository,
  ) {}

  async register(registerDto: RegisterUserDTO): Promise<AuthResponseDTO> {
    const { email, password, username } = registerDto;
    const user = await this.userRepository.create({
      email,
      password,
      username,
    });

    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDTO> {
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
      accessToken: access_token,
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
