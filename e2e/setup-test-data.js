const { createClient } = require('@supabase/supabase-js');

async function setupTestData() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Insertar eventos de prueba
  const testEvents = [
    {
      name: 'Hamlet - Prueba',
      description: 'Obra de teatro de prueba para E2E',
      date: '2024-12-25',
      time: '20:00',
      image_url: '/placeholder.svg',
      status: 'active',
      sale_start_time: '2024-12-01T00:00:00Z'
    },
    {
      name: 'Romeo y Julieta - Prueba',
      description: 'Otra obra de teatro de prueba',
      date: '2024-12-26',
      time: '19:30',
      image_url: '/placeholder.svg',
      status: 'active',
      sale_start_time: '2024-12-01T00:00:00Z'
    }
  ];

  for (const event of testEvents) {
    await supabase.from('events').insert(event);
  }

  console.log('✅ Datos de prueba insertados');
}

if (require.main === module) {
  setupTestData();
}

module.exports = { setupTestData }; 