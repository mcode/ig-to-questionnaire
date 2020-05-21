const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const { buildLibrary } = require('./src/builders/libraryBuilder');
const logger = require('./src/helpers/logger');

program
  .requiredOption('-i --ig <path-to-ig>', 'Path to full IG directory')
  .usage('--ig <path-to-ig-directory>')
  .parse(process.argv);

if (!fs.existsSync(program.ig)) {
  console.error(`Error: Directory '${program.ig}' does not exist`);
  process.exit(1);
}

const igDir = path.join(path.resolve(path.join(__dirname, program.ig)), '/site');
const igFile = fs.readdirSync(igDir).find((f) => path.extname(f) === '.json' && f.startsWith('ImplementationGuide'));

logger.info(`parsing ${igFile}`);
const igJson = JSON.parse(fs.readFileSync(path.join(igDir, igFile), 'utf8'));

logger.info('building CQL');
const library = buildLibrary(igDir, igJson);
console.log(`\nResulting CQL:\n\n${library}`);
