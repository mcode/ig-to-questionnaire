const fs = require('fs');
const path = require('path');
const fhirpath = require('fhirpath');
const handlers = require('./handlers');

const RESOURCE_URL = 'http://hl7.org/fhir/tools/StructureDefinition/resource-information';

// const generateValueSetStatement = (name, id) => `valueset "${name}": '${id}'`;
const getIdFromReference = (r) => r.reference.reference.split('/')[1];

function collectValueSets(ig) {
  const valueSetMap = {};
  const query = `ImplementationGuide.definition.resource.where(extension.exists(url='${RESOURCE_URL}' and valueString='ValueSet'))`;
  const valueSetDefs = fhirpath.evaluate(ig, query);
  valueSetDefs.forEach((vs) => {
    const vsId = getIdFromReference(vs);
    valueSetMap[vsId] = vs.name;
  });

  return valueSetMap;
}

function collectResources(igDir, igJson, valueSetMap) {
  const resources = [];
  const query = `ImplementationGuide.definition.resource.where(extension.exists(url='${RESOURCE_URL}' and valueString='StructureDefinition:resource'))`;
  const resourceDefs = fhirpath.evaluate(igJson, query);
  resourceDefs.forEach((r) => {
    const resourceId = getIdFromReference(r);
    const structureDef = JSON.parse(fs.readFileSync(path.join(igDir, `/StructureDefinition-${resourceId}.json`), 'utf8'));
    switch (structureDef.type) {
      case 'Condition':
        resources.push(handlers.handleCondition(structureDef, valueSetMap));
        break;
      case 'DiagnosticReport':
        resources.push(handlers.handleDiagnosticReport(structureDef, valueSetMap));
        break;
      case 'MedicationStatement':
        resources.push(handlers.handleMedicationStatement(structureDef, valueSetMap));
        break;
      case 'Observation':
        resources.push(handlers.handleObservation(structureDef, valueSetMap));
        break;
      case 'Patient':
        resources.push(handlers.handlePatient(structureDef, valueSetMap));
        break;
      case 'Procedure':
        resources.push(handlers.handleProcedure(structureDef, valueSetMap));
        break;
      case 'Specimen':
        resources.push(handlers.handleSpecimen(structureDef, valueSetMap));
        break;
      default:
        console.error(`No handling implemented for ${structureDef.type}`);
    }
  });
  return resources;
}

function generateCQL(library) {
  const {
    name, version, fhirVersion, valueSetMap,
  } = library;

  // Initialize cql with name and version of IG for the library
  let cql = `library ${name} version '${version}'\n\nusing FHIR version '${fhirVersion}'\n\n`;

  // Add valuesets based on map
  Object.entries(valueSetMap).forEach(([vsId, vsName]) => {
    cql += `valueset "${vsName}": '${vsId}'\n`;
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
