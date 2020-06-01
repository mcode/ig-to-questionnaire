const fs = require('fs');
const path = require('path');
const fhirpath = require('fhirpath');
const _ = require('lodash');
const handlers = require('../helpers/handlers');
const logger = require('../helpers/logger');
const { CODE_SYSTEMS } = require('../helpers/constants');

const RESOURCE_URL = 'http://hl7.org/fhir/tools/StructureDefinition/resource-information';

const getIdFromReference = (r) => r.reference.reference.split('/')[1];

function collectValueSets(ig) {
  logger.info('parsing ValueSets');
  const valueSetMap = {};
  const query = `ImplementationGuide.definition.resource.where(extension.exists(url='${RESOURCE_URL}' and valueString='ValueSet'))`;
  const valueSetDefs = fhirpath.evaluate(ig, query);
  valueSetDefs.forEach((vs) => {
    const vsId = getIdFromReference(vs);
    logger.info(`found ValueSet ${vsId}`);
    valueSetMap[vsId] = vs.name;
  });

  return valueSetMap;
}

function collectResources(igDir, igJson, valueSetMap) {
  logger.info('parsing StructureDefinitions');
  const resources = [];
  const query = `ImplementationGuide.definition.resource.where(extension.exists(url='${RESOURCE_URL}' and valueString='StructureDefinition:resource'))`;
  const resourceDefs = fhirpath.evaluate(igJson, query);
  resourceDefs.forEach((r) => {
    const resourceId = getIdFromReference(r);
    const structureDef = JSON.parse(fs.readFileSync(path.join(igDir, `/StructureDefinition-${resourceId}.json`), 'utf8'));
    logger.info(`generating CQL definitions for profile ${structureDef.name}`);
    switch (structureDef.type) {
      case 'Condition':
        resources.push(handlers.handleCondition(structureDef, valueSetMap));
        break;
      case 'Observation':
        resources.push(handlers.handleObservation(structureDef, valueSetMap));
        break;
      case 'Procedure':
        resources.push(handlers.handleProcedure(structureDef, valueSetMap));
        break;
      case 'MedicationStatement':
        // resources.push(handlers.handleMedicationStatement(structureDef, valueSetMap));
        // break;
      case 'DiagnosticReport':
      case 'Patient':
      case 'Specimen':
      default:
        logger.warn(`No handling implemented for ${structureDef.type}. Skipping ${structureDef.name}`);
    }
  });
  return resources;
}

function generateCQL(library) {
  logger.info('generating CQL string');
  const {
    name, version, fhirVersion, valueSetMap, resources,
  } = library;

  // Initialize cql with name and version of IG for the library
  let cql = `library ${name} version '${version}'\n\nusing FHIR version '${fhirVersion}'\n\n`;

  // Add valuesets based on map
  Object.entries(valueSetMap).forEach(([vsId, vsName]) => {
    cql += `valueset "${vsName}": '${vsId}'\n`;
  });

  Object.entries(CODE_SYSTEMS).forEach(([url, systemName]) => {
    cql += `\ncodesystem "${systemName}": '${url}'\n`;
  });

  // Define all codes
  _.flatten(resources.map((r) => r.codes)).forEach((c) => {
    cql += `\ncode "${c.name}": '${c.code}' from "${c.system}"`;
  });

  cql += '\n';

  // Process defintions for all resources
  resources.forEach((r) => {
    r.definitions.forEach((d) => {
      cql += `\ndefine "${d.name}":\n\t[${d.resourceType}: "${d.lookupName}"]\n`;
    });
  });

  return cql;
}

exports.buildLibrary = (igDir, igJson) => {
  const library = {
    name: igJson.name,
    version: igJson.version,
    fhirVersion: igJson.fhirVersion[0],
    valueSetMap: collectValueSets(igJson),
  };

  library.resources = collectResources(igDir, igJson, library.valueSetMap);
  return generateCQL(library);
};
