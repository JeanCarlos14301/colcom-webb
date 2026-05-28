export const MOCK_DB_KEY = 'colcom_mock_db_v3';

const initialData = {
  users: [
    { id: '1', nombre: 'Super', apellido: 'Admin', email: 'super@example.com', username: 'superadmin', password: 'superadmin123*', rol: 'superadmin', pais_id: null, estado: 'activo', pregunta_seguridad: 'mascota', respuesta_seguridad: 'firulais' },
    { id: '2', nombre: 'Admin', apellido: 'Argentina', email: 'admin.arg@example.com', username: 'admin_argentina', password: 'admin123*', rol: 'admin_pais', pais_id: 'arg', estado: 'activo', pregunta_seguridad: 'mascota', respuesta_seguridad: 'firulais' },
    { id: '3', nombre: 'Editor', apellido: 'Argentina', email: 'editor.arg@example.com', username: 'editor_argentina', password: 'editor123*', rol: 'editor', pais_id: 'arg', estado: 'activo', pregunta_seguridad: 'mascota', respuesta_seguridad: 'firulais' },
  ],
  countries: [
    { id: 'arg', nombre: 'Argentina', slug: 'argentina', estado: 'activo' },
    { id: 'chi', nombre: 'Chile', slug: 'chile', estado: 'activo' },
    { id: 'col', nombre: 'Colombia', slug: 'colombia', estado: 'activo' },
    { id: 'ecu', nombre: 'Ecuador', slug: 'ecuador', estado: 'activo' },
  ],
  noticias: [
    { id: 'n1', titulo: 'Noticia 1 Argentina', slug: 'noticia-1-arg', resumen: 'Resumen Argentina', contenido: '<p>Contenido Argentina</p>', pais_id: 'arg', estado: 'publicado', fecha_publicacion: new Date().toISOString(), created_at: new Date().toISOString() },
    { id: 'n2', titulo: 'Noticia 1 Chile', slug: 'noticia-1-chi', resumen: 'Resumen Chile', contenido: '<p>Contenido Chile</p>', pais_id: 'chi', estado: 'publicado', fecha_publicacion: new Date().toISOString(), created_at: new Date().toISOString() },
    { id: 'n3', titulo: 'Lanzamiento en Colombia', slug: 'noticia-col-1', resumen: 'Lanzamiento oficial', contenido: '<p>Iniciamos operaciones en Colombia.</p>', pais_id: 'col', estado: 'publicado', fecha_publicacion: new Date().toISOString(), created_at: new Date().toISOString() },
    { id: 'n4', titulo: 'Nueva alianza en Ecuador', slug: 'noticia-ecu-1', resumen: 'Nueva alianza estratégica', contenido: '<p>Ecuador suma nuevos aliados.</p>', pais_id: 'ecu', estado: 'publicado', fecha_publicacion: new Date().toISOString(), created_at: new Date().toISOString() },
  ],
  testimonios: [
    { id: 't1', nombre: 'Juan Pérez (Arg)', cargo: 'CEO', empresa: 'Empresa A', contenido: 'Excelente servicio en la plataforma.', destacado: true, pais_id: 'arg', estado: 'publicado', created_at: new Date().toISOString() },
    { id: 't2', nombre: 'María Silva (Chi)', cargo: 'Directora', empresa: 'Fundación Vida', contenido: 'Logramos conectar con cientos de mentores rápidamente.', destacado: true, pais_id: 'chi', estado: 'publicado', created_at: new Date().toISOString() },
    { id: 't3', nombre: 'Carlos Ruiz (Col)', cargo: 'Emprendedor', empresa: 'TechSur', contenido: 'Una iniciativa fantástica que nos abrió muchas puertas.', destacado: false, pais_id: 'col', estado: 'publicado', created_at: new Date().toISOString() },
    { id: 't4', nombre: 'Ana Gómez (Ecu)', cargo: 'Gerente', empresa: 'AgroPlus', contenido: 'El impacto regional que están logrando es increíble.', destacado: true, pais_id: 'ecu', estado: 'publicado', created_at: new Date().toISOString() },
    { id: 't5', nombre: 'Luis Martínez (Col)', cargo: 'Consultor', empresa: 'Independiente', contenido: 'Me encanta ser parte de esta comunidad tan activa.', destacado: true, pais_id: 'col', estado: 'publicado', created_at: new Date().toISOString() },
  ],
  solicitudes: [
    { id: 's1', nombre: 'Usuario Interesado', correo: 'interesado@test.com', telefono: '123456789', finalidad: 'Contacto', mensaje: 'Quiero más info', pais_slug: 'argentina', estado: 'pendiente', created_at: new Date().toISOString() },
  ],
  archivos: [],
  auditoria: [
    { id: 'a1', modulo: 'auth', accion: 'login', usuario_id: '1', registro_id: null, detalle: 'Login superadmin', created_at: new Date().toISOString() }
  ],
};

export const getDB = () => {
  try {
    const raw = localStorage.getItem(MOCK_DB_KEY);
    if (!raw) {
      localStorage.setItem(MOCK_DB_KEY, JSON.stringify(initialData));
      return JSON.parse(JSON.stringify(initialData));
    }
    return JSON.parse(raw);
  } catch {
    return initialData;
  }
};

export const saveDB = (db: any) => {
  localStorage.setItem(MOCK_DB_KEY, JSON.stringify(db));
};

export const resetDB = () => {
  localStorage.setItem(MOCK_DB_KEY, JSON.stringify(initialData));
};
