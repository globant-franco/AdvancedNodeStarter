const puppeteer = require("puppeteer");
const sessionFactory = require("../factories/sessionFactory");
const userFactory = require("../factories/userFactory");

class CustomPage {
  static async build() {
    const browser = await puppeteer.launch({
      headless: true,
      //headless: false, // see the browser window in action just for the purpose of this course, by default set it to true
      //args: ["--disable-dev-shm-usage"], // Fixes the error
      args: [
        "--disable-gpu",
        "--no-sandbox",
        "--lang=en-US",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });

    const page = await browser.newPage();
    const customPage = new CustomPage(page);

    return new Proxy(customPage, {
      get: function (target, property) {
        return customPage[property] || browser[property] || page[property];
      },
    });
  }

  constructor(page) {
    this.page = page;
  }

  async login() {
    const user = await userFactory();
    const { sessionString, signature } = sessionFactory(user);

    await this.page.setCookie({ name: "session", value: sessionString });
    await this.page.setCookie({ name: "session.sig", value: signature });

    // refresh to re-render the page and read the new cookie values
    // When authentication completes user is redirected to /blogs
    await this.page.goto("http://localhost:3000/blogs");
    // wait for the page to fully reload
    await this.page.waitFor('a[href="/auth/logout"]');
  }

  async getContentsOf(selector) {
    return this.page.$eval(selector, (el) => el.innerHTML);
  }
}

module.exports = CustomPage;
