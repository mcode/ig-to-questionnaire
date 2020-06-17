import fs from 'fs';
import path from 'path';
import program from 'commander';
import { LibraryBuilder } from './builders/libraryBuilder';
import { logger } from './helpers/logger';
import { convertBasicCQL } from './helpers/cql-to-elm';

program
  .requiredOption('-i --ig <path-to-ig>', 'Path to full IG directory')
  .option('-o --output <path-to-output-dir>', 'Path to desired output directory', './output')
  .usage('--ig <path-to-ig-directory>')
  .parse(process.argv);

if (!fs.existsSync(program.ig)) {
  logger.error(`Error: Directory '${program.ig}' does not exist`);
  process.exit(1);
}

if (!fs.existsSync(program.output)) {
  fs.mkdirSync(program.output, { recursive: true });
}

const igDir = path.join(path.resolve(program.ig), '/site');
const igFile = fs
  .readdirSync(igDir)
  .find((f: string) => path.extname(f) === '.json' && f.startsWith('ImplementationGuide'));

if (!igFile) {
  logger.error('Error: could not find file ImplementationGuide*.json');
  process.exit(1);
}

logger.info(`parsing ${igFile}`);
const igJson = JSON.parse(fs.readFileSync(path.join(igDir, igFile), 'utf8'));
const builder = new LibraryBuilder(igDir, igJson);
const library = builder.buildLibrary();

const outputCQLFile = path.join(program.output, `${igJson.name}.cql`);
fs.writeFileSync(outputCQLFile, library.cql, 'utf8');
logger.info(`wrote CQL output to ${outputCQLFile}`);

const outputLibraryFile = path.join(program.output, `${igJson.name}-library.json`);
fs.writeFileSync(outputLibraryFile, JSON.stringify(library.resource), 'utf8');
logger.info(`wrote FHIR Library to ${outputLibraryFile}`);

logger.info('running ELM translation');
(async () => {
  try {
    const elm = await convertBasicCQL(library.cql);
    const outputELMFile = path.join(program.output, `${igJson.name}-elm.json`);
    fs.writeFileSync(outputELMFile, JSON.stringify(elm), 'utf8');
    logger.info(`wrote ELM output to ${outputELMFile}`);
  } catch (e) {
    logger.error('error translation CQL to ELM');
    console.error(JSON.parse(e.message));
  }
})();