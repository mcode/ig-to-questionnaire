const fhirpath = require('fhirpath');
const { CODE_SYSTEMS } = require('./constants');

function getCodeOrValueSet(resourceType, structureDef, valueSetMap, path='code') {
  const codeQuery = `snapshot.element.where(id = '${resourceType}.${path}').patternCodeableConcept.coding`;
  const vsQuery = `snapshot.element.where(id = '${resourceType}.${path}').binding.valueSet`;

  const code = fhirpath.evaluate(structureDef, codeQuery)[0];
  const vs = fhirpath.evaluate(structureDef, vsQuery)[0];

  if (code) {
    return {
      type: 'code',
      name: `${structureDef.name} Code`,
      code: code.code,
      system: CODE_SYSTEMS[code.system],
    };
  }

  if (vs) {
    const vsId = vs.substring(vs.lastIndexOf('/') + 1);
    return {
      type: 'valueset',
      name: structureDef.name,
      resourceType,
      lookupName: valueSetMap[vsId],
      matchAttribute: path
    };
  }

  return null;
}



exports.handleCondition = (structureDef, valueSetMap) => {
  const retVal = { definitions: [], codes: [] };
  const codeOrVs = getCodeOrValueSet('Condition', structureDef, valueSetMap);

  if (codeOrVs.type === 'code') {
    retVal.codes.push(codeOrVs);
    retVal.definitions.push({
      name: structureDef.name,
      resourceType: 'Condition',
      lookupName: codeOrVs.name,
    });
  } else if (codeOrVs.type === 'valueset') {
    retVal.definitions.push(codeOrVs);
  }

  return retVal;
};

exports.handleObservation = (structureDef, valueSetMap) => {
  const retVal = { definitions: [], codes: [] };
  const codeOrVs = getCodeOrValueSet('Observation', structureDef, valueSetMap);

  if (codeOrVs.type === 'code') {
    retVal.codes.push(codeOrVs);
    retVal.definitions.push({
      name: structureDef.name,
      resourceType: 'Observation',
      lookupName: codeOrVs.name,
    });
  } else if (codeOrVs.type === 'valueset') {
    retVal.definitions.push(codeOrVs);
  }

  return retVal;
};

exports.handleSpecimen = (structureDef, valueSetMap) => { 
  const retVal = { definitions: [], codes: [] };
  const codeOrVs = getCodeOrValueSet('Specimen', structureDef, valueSetMap,'type');


  if (codeOrVs.type === 'code') {
    retVal.codes.push(codeOrVs);
    retVal.definitions.push({
      name: structureDef.name,
      resourceType: 'Specimen',
      lookupName: codeOrVs.name,
      matchAttribute: 'type'
    });
  } else if (codeOrVs.type === 'valueset') {
    retVal.definitions.push(codeOrVs);
  }

  return retVal;
};

exports.handleProcedure = (structureDef, valueSetMap) => { 
  const retVal = { definitions: [], codes: [] };
  const codeOrVs = getCodeOrValueSet('Procedure', structureDef, valueSetMap,'category');
  

  if (codeOrVs.type === 'code') {
    retVal.codes.push(codeOrVs);
    retVal.definitions.push({
      name: structureDef.name,
      resourceType: 'Procedure',
      lookupName: codeOrVs.name,
      matchAttribute: 'category'
    });
  } else if (codeOrVs.type === 'valueset') {
    retVal.definitions.push(codeOrVs);
  }

  return retVal;
};
// TODO
exports.handleDiagnosticReport = (structureDef, valueSetMap) => ({ definitions: [] });
exports.handleMedicationStatement = (structureDef, valueSetMap) => ({ definitions: [] });
// exports.handlePatient = (structureDef, valueSetMap) => ({ definitions: [] });
// exports.handleProcedure = (structureDef, valueSetMap) => ({ definitions: [] });
// exports.handleSpecimen = (structureDef, valueSetMap) => ({ definitions: [] });
