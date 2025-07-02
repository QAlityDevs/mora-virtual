const { execSync, exec } = require('child_process');

module.exports = async function globalSetup() {
  console.log('🚀 Iniciando servidor de desarrollo para pruebas E2E...');
  
  // Iniciar el servidor de desarrollo si no está corriendo
  try {
    // Verificar si el servidor ya está corriendo
    execSync('curl http://localhost:3000', { stdio: 'ignore' });
    console.log('✅ Servidor ya está corriendo en http://localhost:3000');
  } catch (error) {
    console.log('🚀 Iniciando servidor de desarrollo...: ', error);
    // Iniciar servidor en background
    execSync('env $(cat .env.local | xargs) npm run dev &', { stdio: 'ignore' });
    
    // Esperar a que el servidor esté listo
    let retries = 0;
    while (retries < 30) {
      try {
        execSync('curl http://localhost:3000', { stdio: 'ignore' });
        console.log('✅ Servidor iniciado correctamente');
        break;
      } catch (error) {
        retries++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    if (retries >= 30) {
      throw new Error('No se pudo iniciar el servidor de desarrollo');
    }
  }
}; 
