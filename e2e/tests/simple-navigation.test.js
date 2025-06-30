const SeleniumTestSetup = require('../selenium-setup');
const { By } = require('selenium-webdriver');

describe('Navegación Simple - Teatro Mora Virtual', () => {
  let testSetup;

  beforeAll(async () => {
    testSetup = new SeleniumTestSetup();
    await testSetup.setupDriver();
  });

  afterAll(async () => {
    await testSetup.teardown();
  });

  test('Debería cargar la página principal', async () => {
    await testSetup.navigateTo('/');
    
    // Verificar que la página se carga
    const title = await testSetup.driver.getTitle();
    expect(title).toContain('Teatro Mora Virtual');
    
    // Verificar que hay contenido
    await testSetup.waitForElementVisible('h1');
    const heroTitle = await testSetup.getText('h1');
    expect(heroTitle).toContain('Teatro Mora Virtual');
  });

  test('Debería navegar a la página de eventos', async () => {
    await testSetup.navigateTo('/eventos');
    
    // Verificar que la página se carga
    await testSetup.waitForElementVisible('h1');
    const title = await testSetup.getText('h1');
    expect(title).toBe('Eventos');
  });

  test('Debería navegar a la página de autenticación', async () => {
    await testSetup.navigateTo('/auth');
    
    // Verificar que la página se carga
    await testSetup.waitForElementVisible('h1');
    const title = await testSetup.getText('h1');
    expect(title).toBe('Acceso a Teatro Mora');
    
    // Verificar que hay formularios
    await testSetup.waitForElementVisible('#email');
    await testSetup.waitForElementVisible('#password');
  });

  test('Debería mostrar elementos de la página principal', async () => {
    await testSetup.navigateTo('/');
    
    // Verificar sección hero
    await testSetup.waitForElementVisible('h1');
    
    // Verificar sección de eventos
    await testSetup.waitForElementVisible('h2');
    const sectionTitle = await testSetup.getText('h2');
    expect(sectionTitle).toBe('Próximos Eventos');
    
    // Verificar que hay tarjetas de eventos
    const cards = await testSetup.driver.findElements(By.css('.bg-card'));
    expect(cards.length).toBeGreaterThan(0);
  });

  test('Debería navegar desde la página principal a eventos', async () => {
    await testSetup.navigateTo('/');
    
    // Hacer clic en el enlace de eventos
    await testSetup.clickElement('a[href="/eventos"]');
    
    // Verificar que se navegó correctamente
    await testSetup.driver.sleep(3000);
    const currentUrl = await testSetup.driver.getCurrentUrl();
    expect(currentUrl).toContain('/eventos');
  });
}); 