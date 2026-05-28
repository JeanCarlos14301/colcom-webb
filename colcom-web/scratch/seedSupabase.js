const SUPABASE_URL = 'https://pbdwphfortpwlkrzyrpc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBiZHdwaGZvcnRwd2xrcnp5cnBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODY3NTM2NCwiZXhwIjoyMDk0MjUxMzY0fQ.fJ_-kWmzMApKFYyiihkBp-i4rw8pC5SdXyb1zfeteTw';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
};

const PAISES = {
  colombia: '3c3ddf28-0340-44d5-8f5d-071424c99f1b',
  chile: '391fde34-e46d-4c9f-a1a6-c636676ecbe4',
  ecuador: '5ff12d2d-ab86-46c9-9961-86226bdce283'
};

const noticias = [
  { titulo: 'Lanzamiento en Colombia', slug: 'lanzamiento-colombia-1', resumen: 'Iniciamos operaciones en Colombia con gran éxito', contenido: '<p>Colombia Comparte inicia sus labores apoyando a múltiples empresas.</p>', pais_id: PAISES.colombia, estado: 'publicado', fecha_publicacion: new Date().toISOString() },
  { titulo: 'Alianza en Bogotá', slug: 'alianza-bogota', resumen: 'Nueva alianza estratégica en Bogotá', contenido: '<p>Hemos firmado un importante acuerdo en la capital.</p>', pais_id: PAISES.colombia, estado: 'publicado', fecha_publicacion: new Date().toISOString() },
  
  { titulo: 'Expansión en Chile', slug: 'expansion-chile-1', resumen: 'Chile Comparte llega a más regiones', contenido: '<p>Nuevos proyectos en el sur de Chile.</p>', pais_id: PAISES.chile, estado: 'publicado', fecha_publicacion: new Date().toISOString() },
  { titulo: 'Voluntariado en Santiago', slug: 'voluntariado-santiago', resumen: 'Gran jornada de voluntariado', contenido: '<p>Más de 500 voluntarios participaron.</p>', pais_id: PAISES.chile, estado: 'publicado', fecha_publicacion: new Date().toISOString() },

  { titulo: 'Nuevos aliados en Ecuador', slug: 'aliados-ecuador-1', resumen: 'Ecuador suma empresas colaboradoras', contenido: '<p>Varias empresas líderes se unen a Ecuador Comparte.</p>', pais_id: PAISES.ecuador, estado: 'publicado', fecha_publicacion: new Date().toISOString() },
  { titulo: 'Impacto Social en Quito', slug: 'impacto-quito', resumen: 'Resultados del último trimestre', contenido: '<p>Mejoramos la calidad de vida de 200 familias.</p>', pais_id: PAISES.ecuador, estado: 'publicado', fecha_publicacion: new Date().toISOString() }
];

const testimonios = [
  { nombre: 'Carlos Ruiz', cargo: 'Emprendedor', empresa: 'TechSur', contenido: 'Una iniciativa fantástica que nos abrió muchas puertas.', destacado: true, pais_id: PAISES.colombia, estado: 'publicado' },
  { nombre: 'Luis Martínez', cargo: 'Consultor', empresa: 'Independiente', contenido: 'Me encanta ser parte de esta comunidad tan activa.', destacado: false, pais_id: PAISES.colombia, estado: 'publicado' },

  { nombre: 'María Silva', cargo: 'Directora', empresa: 'Fundación Vida', contenido: 'Logramos conectar con cientos de mentores rápidamente en Chile.', destacado: true, pais_id: PAISES.chile, estado: 'publicado' },
  
  { nombre: 'Ana Gómez', cargo: 'Gerente', empresa: 'AgroPlus', contenido: 'El impacto regional que están logrando en Ecuador es increíble.', destacado: true, pais_id: PAISES.ecuador, estado: 'publicado' }
];

async function seed() {
  console.log('Seeding noticias...');
  const resN = await fetch(`${SUPABASE_URL}/rest/v1/noticias`, {
    method: 'POST',
    headers,
    body: JSON.stringify(noticias)
  });
  if (!resN.ok) console.error('Error noticias:', await resN.text());
  else console.log('Noticias inserted');

  console.log('Seeding testimonios...');
  const resT = await fetch(`${SUPABASE_URL}/rest/v1/testimonios`, {
    method: 'POST',
    headers,
    body: JSON.stringify(testimonios)
  });
  if (!resT.ok) console.error('Error testimonios:', await resT.text());
  else console.log('Testimonios inserted');
}

seed();
