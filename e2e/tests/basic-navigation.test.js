const SeleniumTestSetup = require('../selenium-setup');
const { By } = require('selenium-webdriver');

describe('Navegación Básica - Teatro Mora Virtual', () => {
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
    await testSetup.waitForPageLoad();
    
    const title = await testSetup.driver.getTitle();
    expect(title).toContain('Teatro Mora Virtual');
  });

  test('Debería navegar a la página de eventos', async () => {
    await testSetup.navigateTo('/eventos');
    await testSetup.waitForPageLoad();
    
    const title = await testSetup.getText('h1');
    expect(title).toBe('Eventos');
  });

  test('Debería navegar a la página de autenticación', async () => {
    await testSetup.navigateTo('/auth');
    await testSetup.waitForPageLoad();
    
    const title = await testSetup.getText('h1');
    expect(title).toBe('Acceso a Teatro Mora');
  });

  test('Debería navegar a la página de administración', async () => {
    await testSetup.clickElement('[role="tab"]:first-child');
    await testSetup.typeText('#email', process.env.E2E_ADMIN_EMAIL);
    await testSetup.typeText('#password', process.env.E2E_ADMIN_PASSWORD);
    await testSetup.clickElement('button[type="submit"]');
    await testSetup.driver.sleep(3000);
    const url = await testSetup.driver.getCurrentUrl();
    expect(url).not.toContain('/auth');
    await testSetup.navigateTo('/admin');
    await testSetup.waitForPageLoad();
    
    const currentUrl = await testSetup.driver.getCurrentUrl();
    expect(currentUrl).toContain('/admin');
  });

  test('Debería navegar a la página de perfil', async () => {
    await testSetup.navigateTo('/perfil');
    await testSetup.waitForPageLoad();
    
    const currentUrl = await testSetup.driver.getCurrentUrl();
    expect(currentUrl).toContain('/perfil');
  });
}); 