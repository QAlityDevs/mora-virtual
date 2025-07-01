const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const firefox = require("selenium-webdriver/firefox");

class SeleniumTestSetup {
  constructor() {
    this.driver = null;
    this.baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";
  }

  async setupDriver(browser = "chrome") {
    const options = new chrome.Options();

    // Configuración para pruebas E2E
    options.addArguments("--no-sandbox");
    options.addArguments("--disable-dev-shm-usage");
    options.addArguments("--disable-gpu");
    options.addArguments("--window-size=1920,1080");
    options.addArguments("--disable-web-security");
    options.addArguments("--allow-running-insecure-content");
    options.addArguments("--disable-extensions");

    // Headless mode para CI/CD
    if (process.env.CI || process.env.HEADLESS === "true") {
      options.addArguments("--headless");
    }

    this.driver = await new Builder()
      .forBrowser(browser)
      .setChromeOptions(options)
      .build();

    await this.driver.manage().setTimeouts({
      implicit: 10000,
      pageLoad: 30000,
      script: 30000,
    });

    return this.driver;
  }

  async teardown() {
    if (this.driver) {
      await this.driver.quit();
    }
  }

  async navigateTo(path) {
    await this.driver.get(`${this.baseUrl}${path}`);
    // Esperar a que la página cargue completamente
    await this.waitForPageLoad();
  }

  async waitForElement(selector, timeout = 10000) {
    return await this.driver.wait(
      until.elementLocated(By.css(selector)),
      timeout
    );
  }

  async waitForElementVisible(selector, timeout = 10000) {
    const element = await this.waitForElement(selector, timeout);
    return await this.driver.wait(until.elementIsVisible(element), timeout);
  }

  async clickElement(selector) {
    const element = await this.waitForElementVisible(selector);
    await this.driver.executeScript(
      "arguments[0].scrollIntoView(true);",
      element
    );
    await element.click();
  }

  async typeText(selector, text) {
    const element = await this.waitForElementVisible(selector);
    await element.clear();
    await element.sendKeys(text);
  }

  async getText(selector) {
    const element = await this.waitForElementVisible(selector);
    return await element.getText();
  }

  async isElementPresent(selector) {
    try {
      await this.waitForElement(selector, 5000);
      return true;
    } catch {
      return false;
    }
  }

  async takeScreenshot(name) {
    const screenshot = await this.driver.takeScreenshot();
    const fs = require("fs");
    const path = require("path");
    const screenshotDir = path.join(__dirname, "screenshots");

    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(screenshotDir, `${name}.png`),
      screenshot,
      "base64"
    );
  }

  // Método para esperar a que la página cargue completamente
  async waitForPageLoad() {
    await this.driver.wait(async () => {
      const readyState = await this.driver.executeScript(
        "return document.readyState"
      );
      return readyState === "complete";
    }, 10000);
  }

  // Método para esperar a que el título esté definido
  async waitForTitle() {
    await this.driver.wait(until.titleIsDefined(), 10000);
  }
}

module.exports = SeleniumTestSetup;
