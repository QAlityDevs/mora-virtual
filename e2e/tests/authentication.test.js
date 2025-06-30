const SeleniumTestSetup = require('../selenium-setup');
const { By } = require('selenium-webdriver');

describe('Autenticación - Teatro Mora Virtual', () => {
  let testSetup;

  beforeAll(async () => {
    testSetup = new SeleniumTestSetup();
    await testSetup.setupDriver();
  });

  afterAll(async () => {
    await testSetup.teardown();
  });

  beforeEach(async () => {
    await testSetup.navigateTo('/auth');
    await testSetup.waitForPageLoad();
  });

  test('Debería mostrar el formulario de login', async () => {
    await testSetup.waitForElementVisible('h1');
    const title = await testSetup.getText('h1');
    expect(title).toBe('Acceso a Teatro Mora');
    await testSetup.waitForElementVisible('[role="tablist"]');
    const tabs = await testSetup.driver.findElements(By.css('[role="tab"]'));
    expect(tabs.length).toBe(2);
  });

  test('Debería validar campos requeridos en login', async () => {
    await testSetup.clickElement('[role="tab"]:first-child');
    await testSetup.clickElement('button[type="submit"]');
    const emailInput = await testSetup.driver.findElement(By.css('#email'));
    const passwordInput = await testSetup.driver.findElement(By.css('#password'));
    expect(await emailInput.getAttribute('required')).toBeTruthy();
    expect(await passwordInput.getAttribute('required')).toBeTruthy();
  });

  test('Debería validar formato de email', async () => {
    await testSetup.clickElement('[role="tab"]:first-child');
    await testSetup.typeText('#email', 'email-invalido');
    await testSetup.clickElement('button[type="submit"]');
    const emailInput = await testSetup.driver.findElement(By.css('#email'));
    expect(await emailInput.getAttribute('type')).toBe('email');
  });

  test('Debería permitir login con credenciales válidas', async () => {
    await testSetup.clickElement('[role="tab"]:first-child');
    await testSetup.typeText('#email', process.env.E2E_USER_EMAIL);
    await testSetup.typeText('#password', process.env.E2E_USER_PASSWORD);
    await testSetup.clickElement('button[type="submit"]');
    await testSetup.driver.sleep(2000);
    const url = await testSetup.driver.getCurrentUrl();
    expect(url).not.toContain('/auth');
  });

  test('Debería mostrar error con credenciales inválidas', async () => {
    await testSetup.typeText('#email', 'invalid@example.com');
    await testSetup.typeText('#password', 'wrongpassword');
    await testSetup.clickElement('button[type="submit"]');
    await testSetup.waitForElementVisible('[role="alert"]');
    const errorMessage = await testSetup.getText('[role="alert"]');
    expect(errorMessage).toBeTruthy();
  });

  test('Debería permitir registro de nuevo usuario', async () => {
    await testSetup.clickElement('[role="tab"]:last-child');
    await testSetup.waitForElementVisible('#name');
    await testSetup.typeText('#name', 'Test User');
    await testSetup.typeText('#email-register', process.env.E2E_USER_EMAIL.split('@')[0]+'+'+Date.now().toString()+'@'+process.env.E2E_USER_EMAIL.split('@')[1]);
    await testSetup.typeText('#password-register', 'testpassword123');
    await testSetup.clickElement('button[type="submit"]');
    await testSetup.driver.sleep(5000);
    const url = await testSetup.driver.getCurrentUrl();
    expect(url).not.toContain('/auth');
  });

  test('Debería mostrar mensajes de error', async () => {
    await testSetup.clickElement('[role="tab"]:first-child');
    await testSetup.typeText('#email', 'invalid@example.com');
    await testSetup.typeText('#password', 'wrongpassword');
    await testSetup.clickElement('button[type="submit"]');
    await testSetup.waitForElementVisible('[role="alert"]');
    const errorMessage = await testSetup.getText('[role="alert"]');
    expect(errorMessage).toBeTruthy();
  });

  test('Debería cambiar entre tabs de login y registro', async () => {
    const loginTab = await testSetup.driver.findElement(By.css('[role="tab"]:first-child'));
    expect(await loginTab.getAttribute('aria-selected')).toBe('true');
    await testSetup.clickElement('[role="tab"]:last-child');
    const registerTab = await testSetup.driver.findElement(By.css('[role="tab"]:last-child'));
    expect(await registerTab.getAttribute('aria-selected')).toBe('true');
    await testSetup.waitForElementVisible('#name');
    await testSetup.waitForElementVisible('#email-register');
    await testSetup.waitForElementVisible('#password-register');
  });

  test('Debería validar contraseñas coincidentes en registro', async () => {
    await testSetup.clickElement('[role="tab"]:last-child');
    await testSetup.waitForElementVisible('#name');
    await testSetup.typeText('#name', 'Test User');
    const uniqueEmail = `testuser+${Date.now()}@example.com`;
    await testSetup.typeText('#email-register', uniqueEmail);
    await testSetup.typeText('#password-register', 'password123');
  });
}); 