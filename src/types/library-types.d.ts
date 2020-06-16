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
}

export interface CQLCodeDefinition {
  name: string;
  code: string;
  system: string;
}

export interface CQLResource {
  definitions: CQLDefinition[];
  codes: CQLCodeDefinition[];
}
