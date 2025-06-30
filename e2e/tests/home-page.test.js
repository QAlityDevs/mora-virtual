const SeleniumTestSetup = require('../selenium-setup');
const { By } = require('selenium-webdriver');

describe('Página Principal - Teatro Mora Virtual', () => {
  let testSetup;

  beforeAll(async () => {
    testSetup = new SeleniumTestSetup();
    await testSetup.setupDriver();
  });

  afterAll(async () => {
    await testSetup.teardown();
  });

  beforeEach(async () => {
    await testSetup.navigateTo('/');
    await testSetup.waitForPageLoad();
  });

  test('Debería cargar la página principal correctamente', async () => {
    // Verificar título de la página
    const title = await testSetup.driver.getTitle();
    expect(title).toContain('Teatro Mora Virtual');

    // Verificar elementos principales
    await testSetup.waitForElementVisible('h1');
    const heroTitle = await testSetup.getText('h1');
    expect(heroTitle).toContain('Teatro Mora Virtual');

    // Verificar sección de eventos destacados
    await testSetup.waitForElementVisible('h2');
    const sectionTitle = await testSetup.getText('h2');
    expect(sectionTitle).toBe('Próximos Eventos');
  });

  test('Debería mostrar eventos destacados', async () => {
    // Verificar que hay tarjetas de eventos (usando selectores reales)
    const eventCards = await testSetup.driver.findElements(By.css('.bg-card'));
    expect(eventCards.length).toBeGreaterThan(0);

    // Verificar estructura de las tarjetas
    if (eventCards.length > 0) {
      const firstCard = eventCards[0];
      const eventTitle = await firstCard.findElement(By.css('h3')).getText();
      expect(eventTitle).toBeTruthy();
    }
  });

  test('Debería navegar a la página de eventos desde el botón principal', async () => {
    // Hacer clic en el botón "Ver Eventos"
    await testSetup.clickElement('a[href="/eventos"]');
    
    // Verificar que se navegó correctamente
    await testSetup.driver.sleep(5000);
    const currentUrl = await testSetup.driver.getCurrentUrl();
    expect(currentUrl).toContain('/eventos');
  });

  test('Debería mostrar las características principales', async () => {
    // Verificar sección de características (usando selectores reales)
    const features = await testSetup.driver.findElements(By.css('.text-center.p-6.border'));
    expect(features.length).toBe(3);

    // Verificar títulos de características
    const featureTitles = await Promise.all(
      features.map(feature => feature.findElement(By.css('h3')).getText())
    );
    
    expect(featureTitles).toContain('Cola Virtual');
    expect(featureTitles).toContain('Foros Interactivos');
    expect(featureTitles).toContain('Selección de Asientos');
  });

  test('Debería ser responsive en diferentes tamaños de pantalla', async () => {
    // Probar en móvil
    await testSetup.driver.manage().window().setRect({ width: 375, height: 667 });
    await testSetup.waitForElementVisible('h1');
    
    // Probar en tablet
    await testSetup.driver.manage().window().setRect({ width: 768, height: 1024 });
    await testSetup.waitForElementVisible('h1');
    
    // Probar en desktop
    await testSetup.driver.manage().window().setRect({ width: 1920, height: 1080 });
    await testSetup.waitForElementVisible('h1');
  });
}); 