const fhirpath = require('fhirpath');

exports.handleCondition = (structureDef, valueSetMap) => {
  const retVal = { definitions: [] };
  const conditionCodeVS = fhirpath.evaluate(structureDef, "snapshot.element.where(id = 'Condition.code').binding.valueSet")[0];
  const vsId = conditionCodeVS.substring(conditionCodeVS.lastIndexOf('/') + 1);
  retVal.definitions.push({
    name: structureDef.name,
    resourceType: 'Condition',
    lookupName: valueSetMap[vsId],
  });

  return retVal;
};

// TODO
// exports.handleDiagnosticReport = (structureDef, valueSetMap) => ({ definitions: [] });
// exports.handleMedicationStatement = (structureDef, valueSetMap) => ({ definitions: [] });
// exports.handleObservation = (structureDef, valueSetMap) => ({ definitions: [] });
// exports.handlePatient = (structureDef, valueSetMap) => ({ definitions: [] });
// exports.handleProcedure = (structureDef, valueSetMap) => ({ definitions: [] });
// exports.handleSpecimen = (structureDef, valueSetMap) => ({ definitions: [] });
