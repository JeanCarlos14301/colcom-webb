import {
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import type { Pool } from 'pg';
import { PG_POOL } from '../database/database.module';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { AUDIT_MODULES, Role } from '../common/constants';
import { JwtPayload, AuthenticatedUser } from '../common/types/jwt-payload';

import { LoginDto } from './dto/login.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { ChangeMyPasswordDto } from './dto/change-my-password.dto';
import { SetSecurityQuestionDto } from './dto/set-security-question.dto';
import { AskSecurityQuestionDto } from './dto/ask-security-question.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

interface UsuarioConRol {
  id: string;
  username: string;
  password_hash: string;
  estado: string;
  pais_id: string | null;
  rol: Role;
  login_intentos: number;
  login_bloqueado_hasta: Date | null;
  nombre: string;
  apellido: string;
  email: string;
  pregunta_seguridad: string | null;
  respuesta_seguridad_hash: string | null;
  pais_slug?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(PG_POOL) private readonly pool: Pool,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly auditoria: AuditoriaService,
    private readonly notificaciones: NotificacionesService,
  ) {}

  private get bcryptRounds(): number {
    return parseInt(this.config.get<string>('BCRYPT_ROUNDS') ?? '10', 10);
  }

  private get maxAttempts(): number {
    return parseInt(this.config.get<string>('LOGIN_MAX_ATTEMPTS') ?? '5', 10);
  }

  private get blockMinutes(): number {
    return parseInt(this.config.get<string>('LOGIN_BLOCK_MINUTES') ?? '15', 10);
  }

  private sanitize(u: UsuarioConRol, paisIds: string[] = []) {
    return {
      id: u.id,
      username: u.username,
      nombre: u.nombre,
      apellido: u.apellido,
      email: u.email,
      rol: u.rol,
      pais_id: u.pais_id,
      pais_slug: u.pais_slug,
      pais_ids: paisIds,
      estado: u.estado,
    };
  }

  private async loadPaisIds(
    usuarioId: string,
    rol: Role,
    paisPrincipal: string | null,
  ): Promise<string[]> {
    if (rol === 'superadmin') return [];
    const { rows } = await this.pool.query<{ pais_id: string }>(
      `SELECT pais_id FROM public.usuario_paises WHERE usuario_id = $1`,
      [usuarioId],
    );
    const extras = rows.map((r) => r.pais_id);
    return paisPrincipal ? [paisPrincipal, ...extras] : extras;
  }

  private async findByUsername(username: string): Promise<UsuarioConRol | null> {
    const { rows } = await this.pool.query<UsuarioConRol>(
      `SELECT u.id, u.username, u.password_hash, u.estado, u.pais_id,
              u.login_intentos, u.login_bloqueado_hasta,
              u.nombre, u.apellido, u.email,
              u.pregunta_seguridad, u.respuesta_seguridad_hash,
              r.nombre AS rol,
              p.slug AS pais_slug
       FROM public.usuarios u
       JOIN public.roles r ON r.id = u.rol_id
       LEFT JOIN public.paises p ON p.id = u.pais_id
       WHERE u.username = $1
       LIMIT 1`,
      [username],
    );
    return rows[0] ?? null;
  }

  private async findById(id: string): Promise<UsuarioConRol | null> {
    const { rows } = await this.pool.query<UsuarioConRol>(
      `SELECT u.id, u.username, u.password_hash, u.estado, u.pais_id,
              u.login_intentos, u.login_bloqueado_hasta,
              u.nombre, u.apellido, u.email,
              u.pregunta_seguridad, u.respuesta_seguridad_hash,
              r.nombre AS rol,
              p.slug AS pais_slug
       FROM public.usuarios u
       JOIN public.roles r ON r.id = u.rol_id
       LEFT JOIN public.paises p ON p.id = u.pais_id
       WHERE u.id = $1
       LIMIT 1`,
      [id],
    );
    return rows[0] ?? null;
  }

  async login(dto: LoginDto, ip: string | null) {
    const user = await this.findByUsername(dto.username);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    if (user.estado !== 'activo') {
      throw new UnauthorizedException('Usuario inactivo');
    }
    if (
      user.login_bloqueado_hasta &&
      new Date(user.login_bloqueado_hasta) > new Date()
    ) {
      throw new UnauthorizedException(
        `Usuario bloqueado hasta ${new Date(user.login_bloqueado_hasta).toISOString()}`,
      );
    }

    const match = await bcrypt.compare(dto.password, user.password_hash);
    if (!match) {
      const newAttempts = (user.login_intentos ?? 0) + 1;
      const shouldBlock = newAttempts >= this.maxAttempts;
      const bloqueadoHasta = shouldBlock
        ? new Date(Date.now() + this.blockMinutes * 60_000)
        : null;
      await this.pool.query(
        `UPDATE public.usuarios
            SET login_intentos = $1,
                login_bloqueado_hasta = $2,
                updated_at = now()
          WHERE id = $3`,
        [newAttempts, bloqueadoHasta, user.id],
      );
      await this.auditoria.registrar({
        usuarioId: user.id,
        accion: 'login_failed',
        modulo: AUDIT_MODULES.AUTH,
        descripcion: `Intento fallido #${newAttempts}${shouldBlock ? ' (bloqueado)' : ''}`,
        ip,
      });
      throw new UnauthorizedException('Credenciales inválidas');
    }

    await this.pool.query(
      `UPDATE public.usuarios
          SET login_intentos = 0,
              login_bloqueado_hasta = NULL,
              ultimo_acceso = now(),
              updated_at = now()
        WHERE id = $1`,
      [user.id],
    );

    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      rol: user.rol,
      pais_id: user.pais_id,
    };
    const accessToken = await this.jwt.signAsync(payload);

    await this.auditoria.registrar({
      usuarioId: user.id,
      accion: 'login',
      modulo: AUDIT_MODULES.AUTH,
      descripcion: `Inicio de sesión exitoso (rol ${user.rol})`,
      ip,
    });

    const paisIds = await this.loadPaisIds(user.id, user.rol, user.pais_id);
    return {
      user: this.sanitize(user, paisIds),
      accessToken,
    };
  }

  async getMe(currentUser: AuthenticatedUser) {
    const u = await this.findById(currentUser.id);
    if (!u) throw new NotFoundException('Usuario no encontrado');
    return this.sanitize(u, currentUser.pais_ids);
  }

  async updateMe(currentUser: AuthenticatedUser, dto: UpdateMeDto, ip: string | null) {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;
    if (dto.nombre !== undefined) {
      fields.push(`nombre = $${idx++}`);
      values.push(dto.nombre);
    }
    if (dto.apellido !== undefined) {
      fields.push(`apellido = $${idx++}`);
      values.push(dto.apellido);
    }
    if (dto.email !== undefined) {
      fields.push(`email = $${idx++}`);
      values.push(dto.email);
    }
    if (fields.length === 0) {
      const u = await this.findById(currentUser.id);
      if (!u) throw new NotFoundException('Usuario no encontrado');
      return this.sanitize(u, currentUser.pais_ids);
    }
    fields.push(`updated_at = now()`);
    values.push(currentUser.id);
    await this.pool.query(
      `UPDATE public.usuarios SET ${fields.join(', ')} WHERE id = $${idx}`,
      values,
    );
    const updated = await this.findById(currentUser.id);
    if (!updated) throw new NotFoundException('Usuario no encontrado tras actualización');

    await this.auditoria.registrar({
      usuarioId: currentUser.id,
      accion: 'actualizar_perfil',
      modulo: AUDIT_MODULES.AUTH,
      registroId: currentUser.id,
      descripcion: `Actualizó campos: ${Object.entries(dto)
        .filter(([, v]) => v !== undefined)
        .map(([k]) => k)
        .join(', ')}`,
      ip,
    });

    return this.sanitize(updated, currentUser.pais_ids);
  }

  async changeMyPassword(
    currentUser: AuthenticatedUser,
    dto: ChangeMyPasswordDto,
    ip: string | null,
  ) {
    const user = await this.findById(currentUser.id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    const ok = await bcrypt.compare(dto.current_password, user.password_hash);
    if (!ok) throw new UnauthorizedException('Contraseña actual incorrecta');
    const hash = await bcrypt.hash(dto.new_password, this.bcryptRounds);
    await this.pool.query(
      `UPDATE public.usuarios
          SET password_hash = $1, updated_at = now()
        WHERE id = $2`,
      [hash, currentUser.id],
    );
    await this.auditoria.registrar({
      usuarioId: currentUser.id,
      accion: 'cambiar_contrasena',
      modulo: AUDIT_MODULES.AUTH,
      registroId: currentUser.id,
      descripcion: 'Cambio de contraseña por el propio usuario',
      ip,
    });
    await this.notificaciones.crear({
      usuarioId: currentUser.id,
      tipo: 'sistema',
      titulo: 'Contraseña actualizada',
      mensaje: 'Tu contraseña fue cambiada correctamente.',
      icono: 'shield',
      metadata: { ip },
    });
    return { message: 'Contraseña actualizada' };
  }

  async setSecurityQuestion(
    currentUser: AuthenticatedUser,
    dto: SetSecurityQuestionDto,
    ip: string | null,
  ) {
    const respuestaHash = await bcrypt.hash(
      dto.respuesta_seguridad.toLowerCase().trim(),
      this.bcryptRounds,
    );
    await this.pool.query(
      `UPDATE public.usuarios
          SET pregunta_seguridad = $1,
              respuesta_seguridad_hash = $2,
              updated_at = now()
        WHERE id = $3`,
      [dto.pregunta_seguridad, respuestaHash, currentUser.id],
    );
    await this.auditoria.registrar({
      usuarioId: currentUser.id,
      accion: 'configurar_pregunta',
      modulo: AUDIT_MODULES.AUTH,
      registroId: currentUser.id,
      descripcion: 'Configuró/actualizó pregunta de seguridad',
      ip,
    });
    return { message: 'Pregunta de seguridad actualizada' };
  }

  async getSecurityQuestionByUsername(dto: AskSecurityQuestionDto) {
    const { rows } = await this.pool.query<{ pregunta_seguridad: string | null }>(
      `SELECT pregunta_seguridad FROM public.usuarios WHERE username = $1 LIMIT 1`,
      [dto.username],
    );
    const row = rows[0];
    if (!row || !row.pregunta_seguridad) {
      throw new NotFoundException('No hay pregunta de seguridad configurada');
    }
    return { pregunta_seguridad: row.pregunta_seguridad };
  }

  async forgotPassword(dto: ForgotPasswordDto, ip: string | null) {
    const user = await this.findByUsername(dto.username);
    if (!user || !user.respuesta_seguridad_hash) {
      throw new ForbiddenException('No se puede recuperar la contraseña por este método');
    }
    const ok = await bcrypt.compare(
      dto.respuesta_seguridad.toLowerCase().trim(),
      user.respuesta_seguridad_hash,
    );
    if (!ok) {
      await this.auditoria.registrar({
        usuarioId: user.id,
        accion: 'recuperar_contrasena_fallo',
        modulo: AUDIT_MODULES.AUTH,
        descripcion: 'Respuesta de seguridad incorrecta',
        ip,
      });
      throw new ForbiddenException('Respuesta incorrecta');
    }
    const hash = await bcrypt.hash(dto.new_password, this.bcryptRounds);
    await this.pool.query(
      `UPDATE public.usuarios
          SET password_hash = $1,
              login_intentos = 0,
              login_bloqueado_hasta = NULL,
              updated_at = now()
        WHERE id = $2`,
      [hash, user.id],
    );
    await this.auditoria.registrar({
      usuarioId: user.id,
      accion: 'recuperar_contrasena',
      modulo: AUDIT_MODULES.AUTH,
      registroId: user.id,
      descripcion: 'Contraseña recuperada vía pregunta de seguridad',
      ip,
    });
    await this.notificaciones.crear({
      usuarioId: user.id,
      tipo: 'sistema',
      titulo: 'Contraseña restablecida',
      mensaje:
        'Tu contraseña fue restablecida mediante la pregunta de seguridad.',
      icono: 'warning',
      metadata: { ip },
    });
    return { message: 'Contraseña restablecida' };
  }

  async getMySecurityQuestion(currentUser: AuthenticatedUser) {
    const u = await this.findById(currentUser.id);
    if (!u) throw new NotFoundException('Usuario no encontrado');
    return { pregunta_seguridad: u.pregunta_seguridad ?? null };
  }
}
