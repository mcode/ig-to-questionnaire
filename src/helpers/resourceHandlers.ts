import { R4 } from '@ahryman40k/ts-fhir-types';
import { ValueSetObject, CQLResource, CQLCodeDefinition, CQLDefinition } from '../types/library-types';
// @ts-ignore: fhirpath does not have any types published
import fhirpath from 'fhirpath';
import { logger } from './logger';

function getCodeDataRequirement(resourceType: string, code: R4.ICoding): R4.IDataRequirement {
  return {
    type: resourceType,
    codeFilter: [
      {
        path: 'code',
        code: [
          {
            code: code.code,
            system: code.system
          }
        ]
      }
    ]
  };
}

function getValueSetDataRequirement(resourceType: string, vsId: string): R4.IDataRequirement {
  return {
    type: resourceType,
    codeFilter: [
      {
        path: 'code',
        valueSet: vsId
      }
    ]
  };
}

export class Handler {
  structureDef: R4.IStructureDefinition;
  valueSets: ValueSetObject[];


  constructor(structureDef: R4.IStructureDefinition, valueSets: ValueSetObject[]) {
    this.structureDef = structureDef;
    this.valueSets = valueSets;
  }

  abstract process(): CQLResource;

  getCodeRestriction(resourceType: string, attribute = 'code'): CQLCodeDefinition | null {
    const query = `snapshot.element.where(id = '${resourceType}.${attribute}').patternCodeableConcept.coding`;
    const code = fhirpath.evaluate(this.structureDef, query)[0];

    return code
      ? {
          name: `${this.structureDef.name} Code`,
          code: code.code,
          system: code.system,
          dataRequirement: getCodeDataRequirement(resourceType, code)
        }
      : null;
  }

  getValueSetRestriction(resourceType: string, attribute = 'code'): CQLDefinition | null {
    const query = `snapshot.element.where(id = '${resourceType}.${attribute}').binding.valueSet`;
    const valueSet = fhirpath.evaluate(this.structureDef, query)[0];

    if (valueSet) {
      const vsId = valueSet.substring(valueSet.lastIndexOf('/') + 1);
      const vsObject = this.valueSets.find(v => v.id === vsId);
      return vsObject
        ? {
            name: this.structureDef.name ?? '',
            resourceType,
            lookupName: vsObject.name,
            dataRequirement: getValueSetDataRequirement(resourceType, vsId)
          }
        : null;
    }

    return null;
  }
}

export class BaseHandler extends Handler {
  process() {
    const retVal: CQLResource = { definitions: [], codes: [] };
    const resourceType = this.structureDef.type;
    const codeRestriction = this.getCodeRestriction(resourceType!);
    const valueSetRestriction = this.getValueSetRestriction(resourceType!);

    if (codeRestriction !== null) {
      retVal.codes.push(codeRestriction);
      retVal.definitions.push({
          name: this.structureDef.name ?? '',
          resourceType: resourceType!,
          lookupName: codeRestriction.name,
          dataRequirement: codeRestriction.dataRequirement
        });
    }

    if (valueSetRestriction != null) {
      retVal.definitions.push(valueSetRestriction);
    }

    return retVal;
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
        lookupName: codeRestriction.name,
        dataRequirement: codeRestriction.dataRequirement
      });
    }

    if (valueSetRestriction !== null) {
      retVal.definitions.push(valueSetRestriction);
    }

    return retVal;
  }
}

/*
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
*/

export const handlerLookup: { [key: string]: typeof Handler } = {
  'Condition': BaseHandler,
  'Observation': BaseHandler,
};