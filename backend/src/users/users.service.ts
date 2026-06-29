import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { User } from './user.entity';
import { Profile } from '../profiles/profile.entity';
import { UpdatePermissionsDto } from './dto/update-permissions.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Profile)
    private profilesRepository: Repository<Profile>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['profile'],
    });
  }

  create(user: Partial<User>): Promise<User> {
    const newUser = this.usersRepository.create(user);
    return this.usersRepository.save(newUser);
  }

  async update(userId: number, attrs: { name?: string; image?: string }): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // The profile should always exist if created at sign-up
    if (attrs.name) {
      const nameParts = attrs.name.split(' ');
      user.profile.firstName = nameParts[0];
      user.profile.lastName = nameParts.slice(1).join(' ');
    }
    
    // Only update image if provided
    if (attrs.image) {
      user.profile.image = attrs.image;
    }

    await this.profilesRepository.save(user.profile);

    return user;
  }

  async updatePermissions(id: number, permissionsDto: UpdatePermissionsDto): Promise<User> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, permissionsDto);

    return this.usersRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}