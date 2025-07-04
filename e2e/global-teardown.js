const { execSync } = require('child_process');

module.exports = async function globalTeardown() {
  console.log('🧹 Limpiando después de las pruebas E2E...');
  
  try {
    // Detener el servidor de desarrollo
    execSync('pkill -f "next dev"', { stdio: 'ignore' });
    console.log('✅ Servidor detenido');
  } catch (error) {
    console.log('ℹ️ No se encontró servidor corriendo');
  }
}; 