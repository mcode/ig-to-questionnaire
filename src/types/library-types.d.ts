import { R4 } from '@ahryman40k/ts-fhir-types';

export interface ValueSetObject {
  id: string;
  name: string;
}

export interface ImplementationGuide {
  name: string;
  version: string;
  fhirVersion: string;
  json: R4.IImplementationGuide;
}

export interface CQLDefinition {
  name: string;
  resourceType: string;
  lookupName: string;
  dataRequirement: R4.IDataRequirement;
}

export interface CQLCodeDefinition {
  name: string;
  code: string;
  system: string;
  dataRequirement: R4.IDataRequirement;
}

export interface CQLResource {
  definitions: CQLDefinition[];
  codes: CQLCodeDefinition[];
}

export interface Library {
  cql: string;
  resource: R4.ILibrary;
  questionnaire: R4.IQuestionnaire;
}
