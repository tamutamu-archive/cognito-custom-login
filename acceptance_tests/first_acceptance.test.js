const puppeteer = require('puppeteer')

const baseUrl = 'http://localhost:3000'

describe('Login page', () => {
  test('loads successfully', async () => {
    await page.goto(baseUrl)
    await expect(page).toMatchElement('input', {name: 'email'})
    await expect(page).toMatchElement('input', {name: 'password'})

    await expect(page).toMatch('Log In')
  })
})
