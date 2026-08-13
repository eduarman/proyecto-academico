import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UpdateUserDto } from './dto/update-user.dto';

export type UserRole = 'ADMIN' | 'ESTUDIANTE';
export type UserStatus = 'ACTIVO' | 'INACTIVO';

export interface AppUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
}

export interface CreateUserInput {
  email: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

@Injectable()
export class UsersService {
  private readonly users: AppUser[] = [
    {
      id: 'admin-1',
      email: 'admin@academia.com',
      firstName: 'Admin',
      lastName: 'Sistema',
      role: 'ADMIN',
      status: 'ACTIVO',
    },
    {
      id: 'user-1',
      email: 'estudiante@academia.com',
      firstName: 'Ana',
      lastName: 'García',
      role: 'ESTUDIANTE',
      status: 'ACTIVO',
    },
  ];

  findAll(role?: string, status?: string) {
    return this.users.filter((user) => {
      const roleMatch = !role || user.role === role;
      const statusMatch = !status || user.status === status;
      return roleMatch && statusMatch;
    });
  }

  findOne(id: string) {
    const user = this.users.find((entry) => entry.id === id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  tryFindOne(id: string) {
    return this.users.find((entry) => entry.id === id);
  }

  findByEmail(email: string) {
    return this.users.find((entry) => entry.email === email);
  }

  create(data: CreateUserInput) {
    if (this.findByEmail(data.email)) {
      throw new ConflictException('El email ya está registrado');
    }

    const user: AppUser = {
      id: randomUUID(),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role ?? 'ESTUDIANTE',
      status: 'ACTIVO',
    };
    this.users.push(user);
    return user;
  }

  updateProfile(id: string, payload: UpdateUserDto) {
    const user = this.findOne(id);

    Object.assign(user, {
      firstName: payload.firstName ?? user.firstName,
      lastName: payload.lastName ?? user.lastName,
      status: payload.status ?? user.status,
      role: payload.role ?? user.role,
    });

    return user;
  }
}
