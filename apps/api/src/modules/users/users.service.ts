import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateUserDto, UpdateUserBodyDTO } from '@repo/api';
import { User } from '~/modules/users/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async create(input: CreateUserDto): Promise<User> {
    const { password, ...rest } = input;

    const newUser = this.userRepository.create({
      email: rest.email,
      username: rest.username,
      password,
    });
    return this.userRepository.save(newUser);
  }

  async update(id: string, updates: UpdateUserBodyDTO): Promise<User | null> {
    const rest = updates;

    const toUpdate: Partial<User> = {};
    if (rest.email) toUpdate.email = rest.email;
    if (rest.username) toUpdate.username = rest.username;

    await this.userRepository.update(id, toUpdate);
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }
}
