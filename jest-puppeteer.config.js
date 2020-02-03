module.exports = {
  launch: {
    dumpio: true,
    headless: true,
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  },
  server: {
    command: 'ENV_PATH=./env/.integration.env npm run open:src',
    launchTimeout: 10000,
    port: 3000
  },
  browserContext: 'default'
}
