const fs = require('node:fs');
const path = require('node:path');

// Reutiliza un navegador instalado. CHROME_BIN o CHROME_PATH permiten indicar otro ejecutable.
const candidates = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'];
if (!process.env.CHROME_BIN) {
  const browser = candidates.find(candidate => candidate && fs.existsSync(candidate));
  if (browser) process.env.CHROME_BIN = browser;
}
module.exports = config => config.set({
  basePath: '',
  frameworks: ['jasmine'],
  plugins: [require('karma-jasmine'), require('karma-chrome-launcher'), require('karma-coverage')],
  browsers: ['ChromeHeadless'],
  reporters: ['progress'],
  client: { clearContext: true, jasmine: { random: true } },
  coverageReporter: {
    dir: path.join(__dirname, 'coverage/frontend-autos'), subdir: '.',
    reporters: [{ type: 'html' }, { type: 'lcovonly' }, { type: 'json-summary' }, { type: 'text-summary' }],
  },
  restartOnFileChange: true,
});
