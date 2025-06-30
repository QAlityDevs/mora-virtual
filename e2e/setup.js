// Configuración global para pruebas E2E
require('dotenv').config({ path: '.env.local' });
process.env.TEST_BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
process.env.CI = process.env.CI || false;

// Configurar timeouts más largos para E2E
jest.setTimeout(60000); 