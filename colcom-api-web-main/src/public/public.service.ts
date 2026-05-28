import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Pool } from 'pg';
import { PG_POOL } from '../database/database.module';
import {
  PaginationDto,
  buildPagination,
} from '../common/dto/pagination.dto';

interface NoticiaPublica {
  id: string;
  titulo: string;
  slug: string;
  resumen: string | null;
  contenido: string | null;
  imagen_principal_url: string | null;
  estado: string;
  fecha_publicacion: Date | null;
  pais: { slug: string; nombre: string };
}

interface TestimonioPublico {
  id: string;
  nombre: string;
  cargo: string | null;
  empresa: string | null;
  contenido: string;
  foto_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  destacado: boolean;
  estado: string;
  fecha_publicacion: Date | null;
  pais: { slug: string; nombre: string };
}

interface PaisPublico {
  id: string;
  nombre: string;
  codigo: string;
  slug: string;
}

@Injectable()
export class PublicService {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  private async findPaisIdBySlug(slug: string): Promise<{
    id: string;
    nombre: string;
    slug: string;
  }> {
    const { rows } = await this.pool.query<{
      id: string;
      nombre: string;
      slug: string;
    }>(
      `SELECT id, nombre, slug FROM public.paises
        WHERE slug = $1 AND estado = 'activo'
        LIMIT 1`,
      [slug],
    );
    if (!rows[0]) throw new NotFoundException(`País "${slug}" no encontrado`);
    return rows[0];
  }

  async listPaisesPublicos(): Promise<PaisPublico[]> {
    const { rows } = await this.pool.query<PaisPublico>(
      `SELECT id, nombre, codigo, slug
         FROM public.paises
        WHERE estado = 'activo'
        ORDER BY nombre ASC`,
    );
    return rows;
  }

  async findPaisPublico(slug: string): Promise<PaisPublico> {
    const { rows } = await this.pool.query<PaisPublico>(
      `SELECT id, nombre, codigo, slug
         FROM public.paises
        WHERE slug = $1 AND estado = 'activo'
        LIMIT 1`,
      [slug],
    );
    if (!rows[0]) throw new NotFoundException(`País "${slug}" no encontrado`);
    return rows[0];
  }

  async listNoticiasGlobales(pag: PaginationDto, paisSlug?: string) {
    const { page, limit } = pag;
    const offset = (page - 1) * limit;
    const slugFilter = paisSlug ?? null;

    const { rows } = await this.pool.query(
      `SELECT n.id, n.titulo, n.slug, n.resumen, n.contenido,
              n.imagen_principal_url, n.estado, n.fecha_publicacion,
              p.slug AS pais_slug, p.nombre AS pais_nombre
         FROM public.noticias n
         JOIN public.paises p ON p.id = n.pais_id
        WHERE n.estado = 'publicado'
          AND p.estado = 'activo'
          AND ($1::text IS NULL OR p.slug = $1)
        ORDER BY COALESCE(n.fecha_publicacion, n.created_at) DESC
        LIMIT $2 OFFSET $3`,
      [slugFilter, limit, offset],
    );
    const { rows: cnt } = await this.pool.query<{ total: number }>(
      `SELECT COUNT(*)::int AS total
         FROM public.noticias n
         JOIN public.paises p ON p.id = n.pais_id
        WHERE n.estado = 'publicado'
          AND p.estado = 'activo'
          AND ($1::text IS NULL OR p.slug = $1)`,
      [slugFilter],
    );
    const items: NoticiaPublica[] = rows.map((r) => ({
      id: r.id,
      titulo: r.titulo,
      slug: r.slug,
      resumen: r.resumen,
      contenido: r.contenido,
      imagen_principal_url: r.imagen_principal_url,
      estado: r.estado,
      fecha_publicacion: r.fecha_publicacion,
      pais: { slug: r.pais_slug, nombre: r.pais_nombre },
    }));
    return {
      items,
      pagination: buildPagination(cnt[0].total, page, limit),
    };
  }

  async listTestimoniosGlobales(pag: PaginationDto, paisSlug?: string) {
    const { page, limit } = pag;
    const offset = (page - 1) * limit;
    const slugFilter = paisSlug ?? null;

    const { rows } = await this.pool.query(
      `SELECT t.id, t.nombre, t.cargo, t.empresa, t.contenido, t.foto_url,
              t.instagram_url, t.facebook_url, t.destacado, t.estado, t.fecha_publicacion,
              p.slug AS pais_slug, p.nombre AS pais_nombre
         FROM public.testimonios t
         JOIN public.paises p ON p.id = t.pais_id
        WHERE t.estado = 'publicado'
          AND p.estado = 'activo'
          AND ($1::text IS NULL OR p.slug = $1)
        ORDER BY t.destacado DESC, COALESCE(t.fecha_publicacion, t.created_at) DESC
        LIMIT $2 OFFSET $3`,
      [slugFilter, limit, offset],
    );
    const { rows: cnt } = await this.pool.query<{ total: number }>(
      `SELECT COUNT(*)::int AS total
         FROM public.testimonios t
         JOIN public.paises p ON p.id = t.pais_id
        WHERE t.estado = 'publicado'
          AND p.estado = 'activo'
          AND ($1::text IS NULL OR p.slug = $1)`,
      [slugFilter],
    );
    const items: TestimonioPublico[] = rows.map((r) => ({
      id: r.id,
      nombre: r.nombre,
      cargo: r.cargo,
      empresa: r.empresa,
      contenido: r.contenido,
      foto_url: r.foto_url,
      instagram_url: r.instagram_url,
      facebook_url: r.facebook_url,
      destacado: r.destacado,
      estado: r.estado,
      fecha_publicacion: r.fecha_publicacion,
      pais: { slug: r.pais_slug, nombre: r.pais_nombre },
    }));
    return {
      items,
      pagination: buildPagination(cnt[0].total, page, limit),
    };
  }

  async listNoticiasPublicas(paisSlug: string, pag: PaginationDto) {
    const { page, limit } = pag;
    const offset = (page - 1) * limit;
    
    let whereClause = `WHERE estado = 'publicado'`;
    let params: any[] = [limit, offset];
    
    if (paisSlug !== 'latam') {
      const pais = await this.findPaisIdBySlug(paisSlug);
      whereClause += ` AND pais_id = $3`;
      params.push(pais.id);
    }

    const { rows } = await this.pool.query(
      `SELECT n.id, n.titulo, n.slug, n.resumen, n.contenido, n.imagen_principal_url, n.estado, n.fecha_publicacion, p.slug as pais_slug, p.nombre as pais_nombre
         FROM public.noticias n
         JOIN public.paises p ON n.pais_id = p.id
        ${whereClause}
        ORDER BY COALESCE(n.fecha_publicacion, n.created_at) DESC
        LIMIT $1 OFFSET $2`,
      params,
    );
    
    let cntParams: any[] = [];
    if (paisSlug !== 'latam') {
      cntParams.push(params[2]);
    }
    const { rows: cnt } = await this.pool.query<{ total: number }>(
      `SELECT COUNT(*)::int AS total
         FROM public.noticias n
        ${whereClause.replace(/\$3/g, '$1')}`,
      cntParams,
    );
    const items: NoticiaPublica[] = rows.map((r) => ({
      id: r.id,
      titulo: r.titulo,
      slug: r.slug,
      resumen: r.resumen,
      contenido: r.contenido,
      imagen_principal_url: r.imagen_principal_url,
      estado: r.estado,
      fecha_publicacion: r.fecha_publicacion,
      pais: { slug: r.pais_slug, nombre: r.pais_nombre },
    }));
    return {
      items,
      pagination: buildPagination(cnt[0].total, page, limit),
    };
  }

  async findNoticiaPublica(paisSlug: string, noticiaSlug: string) {
    const pais = await this.findPaisIdBySlug(paisSlug);
    const { rows } = await this.pool.query(
      `SELECT id, titulo, slug, resumen, contenido, imagen_principal_url, estado, fecha_publicacion
         FROM public.noticias
        WHERE pais_id = $1 AND slug = $2 AND estado = 'publicado'
        LIMIT 1`,
      [pais.id, noticiaSlug],
    );
    if (!rows[0]) throw new NotFoundException('Noticia no disponible');
    const r = rows[0];
    return {
      id: r.id,
      titulo: r.titulo,
      slug: r.slug,
      resumen: r.resumen,
      contenido: r.contenido,
      imagen_principal_url: r.imagen_principal_url,
      estado: r.estado,
      fecha_publicacion: r.fecha_publicacion,
      pais: { slug: pais.slug, nombre: pais.nombre },
    } as NoticiaPublica;
  }

  async listTestimoniosPublicos(paisSlug: string, pag: PaginationDto) {
    const { page, limit } = pag;
    const offset = (page - 1) * limit;

    let whereClause = `WHERE estado = 'publicado'`;
    let params: any[] = [limit, offset];
    
    if (paisSlug !== 'latam') {
      const pais = await this.findPaisIdBySlug(paisSlug);
      whereClause += ` AND pais_id = $3`;
      params.push(pais.id);
    }

    const { rows } = await this.pool.query(
      `SELECT t.id, t.nombre, t.cargo, t.empresa, t.contenido, t.foto_url, t.instagram_url, t.facebook_url, t.destacado, p.slug as pais_slug, p.nombre as pais_nombre
         FROM public.testimonios t
         JOIN public.paises p ON t.pais_id = p.id
        ${whereClause}
        ORDER BY t.destacado DESC, t.created_at DESC
        LIMIT $1 OFFSET $2`,
      params,
    );

    let cntParams: any[] = [];
    if (paisSlug !== 'latam') {
      cntParams.push(params[2]);
    }
    const { rows: cnt } = await this.pool.query<{ total: number }>(
      `SELECT COUNT(*)::int AS total
         FROM public.testimonios t
        ${whereClause.replace(/\$3/g, '$1')}`,
      cntParams,
    );

    const items: TestimonioPublico[] = rows.map((r) => ({
      id: r.id,
      nombre: r.nombre,
      cargo: r.cargo,
      empresa: r.empresa,
      contenido: r.contenido,
      foto_url: r.foto_url,
      instagram_url: r.instagram_url,
      facebook_url: r.facebook_url,
      destacado: r.destacado,
      estado: r.estado,
      fecha_publicacion: r.fecha_publicacion,
      pais: { slug: r.pais_slug, nombre: r.pais_nombre },
    }));
    return {
      items,
      pagination: buildPagination(cnt[0].total, page, limit),
    };
  }

  async findTestimonioPublico(paisSlug: string, id: string) {
    const pais = await this.findPaisIdBySlug(paisSlug);
    const { rows } = await this.pool.query(
      `SELECT id, nombre, cargo, empresa, contenido, foto_url,
              instagram_url, facebook_url, destacado, estado, fecha_publicacion
         FROM public.testimonios
        WHERE pais_id = $1 AND id = $2 AND estado = 'publicado'
        LIMIT 1`,
      [pais.id, id],
    );
    if (!rows[0]) throw new NotFoundException('Testimonio no disponible');
    const r = rows[0];
    return {
      id: r.id,
      nombre: r.nombre,
      cargo: r.cargo,
      empresa: r.empresa,
      contenido: r.contenido,
      foto_url: r.foto_url,
      instagram_url: r.instagram_url,
      facebook_url: r.facebook_url,
      destacado: r.destacado,
      estado: r.estado,
      fecha_publicacion: r.fecha_publicacion,
      pais: { slug: pais.slug, nombre: pais.nombre },
    } as TestimonioPublico;
  }
}
