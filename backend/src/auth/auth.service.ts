import { Injectable, UnauthorizedException } from '@nestjs/common';

export interface AuthUser {
  id: string;
  email: string;
  password: string;
  name: string;
}

@Injectable()
export class AuthService {
  private users: AuthUser[] = [
    { id: '1', email: 'admin@church.com', password: 'admin123', name: 'Admin' },
    { id: '2', email: 'user@church.com', password: 'user123', name: 'User' },
  ];

  validateUser(email: string, password: string): Omit<AuthUser, 'password'> {
    const user = this.users.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const { password: _, ...safe } = user;
    return safe;
  }
}
