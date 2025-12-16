import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto';
import { Permission, PermissionName } from '../permissions/entities/permission.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, permissionId, ...rest } = createUserDto;

    // Check if email already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Este email já está em uso');
    }

    // Get permission (default to READER if not specified)
    let permission: Permission;
    if (permissionId) {
      permission = await this.permissionsRepository.findOne({
        where: { id: permissionId },
      });
      if (!permission) {
        throw new BadRequestException('Permissão não encontrada');
      }
    } else {
      permission = await this.permissionsRepository.findOne({
        where: { name: PermissionName.READER },
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.usersRepository.create({
      ...rest,
      email,
      password: hashedPassword,
      permission,
    });

    await this.usersRepository.save(user);

    // Remove password from response
    const { password: _, ...result } = user;
    return result as User;
  }

  async findAll(): Promise<User[]> {
    const users = await this.usersRepository.find({
      relations: ['permission'],
    });

    // Remove passwords from response
    return users.map((user) => {
      const { password, ...result } = user;
      return result as User;
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['permission'],
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['permission'],
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    const { email, password, permissionId, ...rest } = updateUserDto;

    // Check if email already exists (if being changed)
    if (email && email !== user.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email },
      });

      if (existingUser) {
        throw new ConflictException('Este email já está em uso');
      }
      user.email = email;
    }

    // Update permission if provided
    if (permissionId) {
      const permission = await this.permissionsRepository.findOne({
        where: { id: permissionId },
      });
      if (!permission) {
        throw new BadRequestException('Permissão não encontrada');
      }
      user.permission = permission;
    }

    // Hash new password if provided
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    // Update other fields
    Object.assign(user, rest);

    await this.usersRepository.save(user);

    // Remove password from response
    const { password: _, ...result } = user;
    return result as User;
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }
}
