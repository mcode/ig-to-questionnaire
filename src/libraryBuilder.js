const fs = require('fs');
const path = require('path');
const fhirpath = require('fhirpath');
const handlers = require('./handlers');

const RESOURCE_URL = 'http://hl7.org/fhir/tools/StructureDefinition/resource-information';

const valueSetLookup = {};

const generateValueSetStatement = (name, id) => {
  valueSetLookup[id] = name;
  return `valueset "${name}": '${id}'`;
};

const getIdFromReference = (r) => r.reference.reference.split('/')[1];

function collectValueSets(ig) {
  let definitions = '';
  const query = `ImplementationGuide.definition.resource.where(extension.exists(url='${RESOURCE_URL}' and valueString='ValueSet'))`;
  const valueSetDefs = fhirpath.evaluate(ig, query);
  valueSetDefs.forEach((vs) => {
    const vsId = getIdFromReference(vs);
    definitions += `${generateValueSetStatement(vs.name, vsId)}\n`;
  });
  return definitions;
}

function collectResources(igDir, igJson) {
  let definitions = '';
  const query = `ImplementationGuide.definition.resource.where(extension.exists(url='${RESOURCE_URL}' and valueString='StructureDefinition:resource'))`;
  const resourceDefs = fhirpath.evaluate(igJson, query);
  resourceDefs.forEach((r) => {
    const resourceId = getIdFromReference(r);
    const structureDef = JSON.parse(fs.readFileSync(path.join(igDir, `/StructureDefinition-${resourceId}.json`), 'utf8'));
    switch (structureDef.type) {
      case 'Condition':
        definitions += handlers.handleCondition(structureDef);
        break;
      case 'DiagnosticReport':
        definitions += handlers.handleDiagnosticReport(structureDef);
        break;
      case 'MedicationStatement':
        definitions += handlers.handleMedicationStatement(structureDef);
        break;
      case 'Observation':
        definitions += handlers.handleObservation(structureDef);
        break;
      case 'Patient':
        definitions += handlers.handlePatient(structureDef);
        break;
      case 'Procedure':
        definitions += handlers.handleProcedure(structureDef);
        break;
      case 'Specimen':
        definitions += handlers.handleSpecimen(structureDef);
        break;
      default:
        console.error(`No handling implemented for ${structureDef.type}`);
    }
  });
  return definitions;
}

exports.buildLibrary = (igDir, igJson) => {
  const valueSetDefines = collectValueSets(igJson);
  const resourceDefines = collectResources(igDir, igJson);
  return valueSetDefines + resourceDefines;
};
