import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Igual que AuthGuard('jwt'), pero nunca rechaza la request: si no hay token o es
// inválido, sigue sin `request.user` en vez de lanzar 401. Úsalo en endpoints de
// lectura que deben ser públicos pero que quieren saber quién es el usuario si
// está logueado (p. ej. el catálogo: todos lo ven, pero el admin ve más).
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(_err: unknown, user: TUser): TUser {
    return user;
  }
}
