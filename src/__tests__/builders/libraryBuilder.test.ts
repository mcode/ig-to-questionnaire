import { R4 } from '@ahryman40k/ts-fhir-types';
import { Base64 } from 'js-base64';
import { LibraryBuilder } from '../../builders/libraryBuilder';
import implementationGuide from '../mock-ig/site/ImplementationGuide.json';
import exampleQuestionnaire from '../mock-ig/questionnaire.json';

const MOCK_IG_DIR = './src/__tests__/mock-ig/site';
const MOCK_CQL = `
library example version '0.0.1'

using FHIR version '4.0.0'

codesystem "LOINC": 'http://loinc.org'

valueset "Example ValueSet": 'example-valueset'

code "ExampleObservation Code": '88040-1' from "LOINC"

code "ExampleDiagnosticReport Code": '81247-9' from "LOINC"

define "ExampleObservation":
    [Observation: "ExampleObservation Code"]

define "ExampleCondition":
    [Condition: "Example ValueSet"]

define "ExampleProcedure":
    [Procedure: "Example ValueSet"]

define "ExampleSpecimen":
    [Specimen: "Example ValueSet"]

define "ExampleDiagnosticReport":
    [DiagnosticReport: "ExampleDiagnosticReport Code"]
    `;

const libraryBuilder = new LibraryBuilder(MOCK_IG_DIR, <R4.IImplementationGuide>implementationGuide, 'example');
const { cql, resource, questionnaire } = libraryBuilder.buildLibrary();

test('basic library info is present', () => {
  expect(cql).toBeDefined();
  expect(resource).toBeDefined();
});

test('cql is generated and encoded onto the library', () => {
  // Trim string to avoid whitespace confusion across machines
  const trimCqlString = (cqlString: string) => {
    return cqlString.replace(/\n/g, '').replace(/\t/g, '').replace(/\s/g, '');
  };

  const MOCK_CQL_TRIMMED = trimCqlString(MOCK_CQL);
  const cqlTrimmed = trimCqlString(cql);

  expect(cqlTrimmed).toEqual(MOCK_CQL_TRIMMED);
  expect(resource.content).toBeDefined();
  expect(resource.content!.length).toBeGreaterThan(0);

  const cqlContent = resource.content!.find(c => c.contentType === 'text/cql');
  const cqlB64 = cqlContent?.data ?? '';

  expect(trimCqlString(Base64.decode(cqlB64))).toEqual(MOCK_CQL_TRIMMED);
});

test('generated questionnaire snippets', () => {
  expect(questionnaire).toEqual(exampleQuestionnaire);
});
