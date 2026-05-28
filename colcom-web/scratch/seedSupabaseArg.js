const SUPABASE_URL = 'https://pbdwphfortpwlkrzyrpc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBiZHdwaGZvcnRwd2xrcnp5cnBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODY3NTM2NCwiZXhwIjoyMDk0MjUxMzY0fQ.fJ_-kWmzMApKFYyiihkBp-i4rw8pC5SdXyb1zfeteTw';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
};

const PAISES = {
  argentina: 'fa3dd9c7-04ee-48b2-b95b-2bba70a56aba'
};

const noticias = [
  { titulo: 'Lanzamiento en Argentina', slug: 'lanzamiento-argentina-1', resumen: 'Iniciamos operaciones en Argentina con gran éxito', contenido: '<p>Argentina Comparte inicia sus labores apoyando a múltiples empresas.</p>', pais_id: PAISES.argentina, estado: 'publicado', fecha_publicacion: new Date().toISOString() },
  { titulo: 'Alianza en Buenos Aires', slug: 'alianza-buenos-aires', resumen: 'Nueva alianza estratégica en Buenos Aires', contenido: '<p>Hemos firmado un importante acuerdo en la capital.</p>', pais_id: PAISES.argentina, estado: 'publicado', fecha_publicacion: new Date().toISOString() },
];

const testimonios = [
  { nombre: 'Martín Pérez', cargo: 'Emprendedor', empresa: 'ArgenTech', contenido: 'Una iniciativa fantástica que nos abrió muchas puertas.', destacado: true, pais_id: PAISES.argentina, estado: 'publicado' },
  { nombre: 'Lucía Fernández', cargo: 'Consultora', empresa: 'Independiente', contenido: 'Me encanta ser parte de esta comunidad tan activa en Argentina.', destacado: false, pais_id: PAISES.argentina, estado: 'publicado' },
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
