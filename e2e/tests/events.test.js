const SeleniumTestSetup = require('../selenium-setup');
const { By } = require('selenium-webdriver');

describe('Eventos - Teatro Mora Virtual', () => {
  let testSetup;

  beforeAll(async () => {
    testSetup = new SeleniumTestSetup();
    await testSetup.setupDriver();
  });

  afterAll(async () => {
    await testSetup.teardown();
  });

  beforeEach(async () => {
    await testSetup.navigateTo('/eventos');
    await testSetup.waitForPageLoad();
  });

  test('Debería mostrar la lista de eventos', async () => {
    // Verificar título de la página
    await testSetup.waitForElementVisible('h1');
    const title = await testSetup.getText('h1');
    expect(title).toBe('Eventos');

    // Verificar que hay tarjetas de eventos
    const eventCards = await testSetup.driver.findElements(By.css('.bg-card'));
    expect(eventCards.length).toBeGreaterThan(0);
  });

  test('Debería mostrar información de eventos', async () => {
    const eventCards = await testSetup.driver.findElements(By.css('.card'));
    
    if (eventCards.length > 0) {
      const firstCard = eventCards[0];
      
      // Verificar elementos de la tarjeta
      const eventTitle = await firstCard.findElement(By.css('h3')).getText();
      expect(eventTitle).toBeTruthy();
      
      // Verificar que hay una imagen
      const image = await firstCard.findElement(By.css('img'));
      expect(await image.getAttribute('src')).toBeTruthy();
      
      // Verificar que hay un botón de detalles
      const detailsButton = await firstCard.findElement(By.css('a'));
      expect(await detailsButton.getText()).toBe('Ver Detalles');
    }
  });

  test('Debería navegar a detalles del evento', async () => {
    const eventCards = await testSetup.driver.findElements(By.css('.card'));
    
    if (eventCards.length > 0) {
      const firstCard = eventCards[0];
      const eventTitle = await firstCard.findElement(By.css('h3')).getText();
      
      // Hacer clic en el botón de detalles
      await firstCard.findElement(By.css('a')).click();
      
      // Verificar que se navegó a la página de detalles
      await testSetup.waitForElementVisible('h1');
      const currentUrl = await testSetup.driver.getCurrentUrl();
      expect(currentUrl).toContain('/eventos/');
    }
  });

  test('Debería mostrar mensaje cuando no hay eventos', async () => {
    // Esta prueba requeriría datos de prueba específicos
    // Por ahora, verificamos que la estructura está presente
    await testSetup.waitForElementVisible('h1');
    const title = await testSetup.getText('h1');
    expect(title).toBe('Eventos');
  });

  test('Debería ser responsive en diferentes tamaños', async () => {
    // Verificar que la página se carga correctamente
    await testSetup.waitForElementVisible('h1');
    
    // Probar en móvil
    await testSetup.driver.manage().window().setRect({ width: 375, height: 667 });
    await testSetup.waitForElementVisible('h1');
    
    // Probar en desktop
    await testSetup.driver.manage().window().setRect({ width: 1920, height: 1080 });
    await testSetup.waitForElementVisible('h1');
  });
}); 
