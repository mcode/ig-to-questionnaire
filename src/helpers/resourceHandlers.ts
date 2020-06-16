import { R4 } from '@ahryman40k/ts-fhir-types';
import { ValueSetObject, CQLResource, CQLCodeDefinition, CQLDefinition } from '../types/library-types';
// @ts-ignore: fhirpath does not have any types published
import fhirpath from 'fhirpath';
import { logger } from './logger';

export abstract class Handler {
  structureDef: R4.IStructureDefinition;
  valueSets: ValueSetObject[];

  constructor(structureDef: R4.IStructureDefinition, valueSets: ValueSetObject[]) {
    this.structureDef = structureDef;
    this.valueSets = valueSets;
  }

  abstract process(): CQLResource;

  getCodeRestriction(resourceType: string): CQLCodeDefinition | null {
    const query = `snapshot.element.where(id = '${resourceType}.code').patternCodeableConcept.coding`;
    const code = fhirpath.evaluate(this.structureDef, query)[0];

    return code
      ? {
          name: `${this.structureDef.name} Code`,
          code: code.code,
          system: code.system
        }
      : null;
  }

  getValueSetRestriction(resourceType: string): CQLDefinition | null {
    const query = `snapshot.element.where(id = '${resourceType}.code').binding.valueSet`;
    const valueSet = fhirpath.evaluate(this.structureDef, query)[0];

    if (valueSet) {
      const vsId = valueSet.substring(valueSet.lastIndexOf('/') + 1);
      const vsObject = this.valueSets.find(v => v.id === vsId);
      return vsObject
        ? {
            name: this.structureDef.name ?? '',
            resourceType,
            lookupName: vsObject.name
          }
        : null;
    }

    return null;
  }
}

class ConditionHandler extends Handler {
  process() {
    const retVal: CQLResource = { definitions: [], codes: [] };
    const codeRestriction = this.getCodeRestriction('Condition');
    const valueSetRestriction = this.getValueSetRestriction('Condition');

    if (codeRestriction !== null) {
      retVal.codes.push(codeRestriction);
      retVal.definitions.push({
        name: this.structureDef.name ?? '',
        resourceType: 'Condition',
        lookupName: codeRestriction.name
      });
    }

    if (valueSetRestriction !== null) {
      retVal.definitions.push(valueSetRestriction);
    }

    return retVal;
  }
}

class ObservationHandler extends Handler {
  process() {
    const retVal: CQLResource = { definitions: [], codes: [] };
    const codeRestriction = this.getCodeRestriction('Observation');
    const valueSetRestriction = this.getValueSetRestriction('Observation');

    if (codeRestriction !== null) {
      retVal.codes.push(codeRestriction);
      retVal.definitions.push({
        name: this.structureDef.name ?? '',
        resourceType: 'Observation',
        lookupName: codeRestriction.name
      });
    }

    if (valueSetRestriction !== null) {
      retVal.definitions.push(valueSetRestriction);
    }

    return retVal;
  }
}

export function createHandler(structureDef: R4.IStructureDefinition, valueSets: ValueSetObject[]): Handler | null {
  switch (structureDef.type) {
    case 'Condition':
      return new ConditionHandler(structureDef, valueSets);
    case 'Observation':
      return new ObservationHandler(structureDef, valueSets);
    case 'DiagnosticReport':
    case 'MedicationStatement':
    case 'Patient':
    case 'Procedure':
    case 'Specimen':
    default:
      logger.warn(`No handling implemented for ${structureDef.type}. Skipping ${structureDef.name}`);
      return null;
  }
}
