import { R4 } from '@ahryman40k/ts-fhir-types';
import { handlerLookup } from '../../helpers/resourceHandlers';
import exampleObservation from '../mock-ig/site/StructureDefinition-example-observation.json';
import exampleCondition from '../mock-ig/site/StructureDefinition-example-condition.json';
import exampleProcedure from '../mock-ig/site/StructureDefinition-example-procedure.json';
import exampleSpecimen from '../mock-ig/site/StructureDefinition-example-specimen.json';
import exampleDiagnosticReport from '../mock-ig/site/StructureDefinition-example-diagnosticreport.json';
import { CQLResource } from '../../types/library-types';

const MOCK_VALUESET_MAP = [
  {
    id: 'example-valueset',
    name: 'Example ValueSet'
  }
];

const EXPECTED_OBSERVATION_DEFINITIONS: CQLResource = {
  definitions: [
    {
      name: 'ExampleObservation',
      resourceType: 'Observation',
      lookupName: 'ExampleObservation Code',
      dataRequirement: {
        type: 'Observation',
        codeFilter: [
          {
            path: 'code',
            code: [
              {
                code: '88040-1',
                system: 'http://loinc.org'
              }
            ]
          }
        ]
      }
    }
  ],
  codes: [
    {
      name: 'ExampleObservation Code',
      code: '88040-1',
      system: 'http://loinc.org',
      dataRequirement: {
        type: 'Observation',
        codeFilter: [
          {
            path: 'code',
            code: [
              {
                code: '88040-1',
                system: 'http://loinc.org'
              }
            ]
          }
        ]
      }
    }
  ]
};

const EXPECTED_CONDITION_DEFINITIONS: CQLResource = {
  definitions: [
    {
      name: 'ExampleCondition',
      resourceType: 'Condition',
      lookupName: 'Example ValueSet',
      dataRequirement: {
        type: 'Condition',
        codeFilter: [
          {
            path: 'code',
            valueSet: 'example-valueset'
          }
        ]
      }
    }
  ],
  codes: []
};

const EXPECTED_PROCEDURE_DEFINITIONS: CQLResource = {
  definitions: [
    {
      name: 'ExampleProcedure',
      resourceType: 'Procedure',
      lookupName: 'Example ValueSet',
      dataRequirement: {
        type: 'Procedure',
        codeFilter: [
          {
            path: 'code',
            valueSet: 'example-valueset'
          }
        ]
      }
    }
  ],
  codes: []
};

const EXPECTED_SPECIMEN_DEFINITIONS: CQLResource = {
  definitions: [
    {
      name: 'ExampleSpecimen',
      resourceType: 'Specimen',
      lookupName: 'Example ValueSet',
      dataRequirement: {
        type: 'Specimen',
        codeFilter: [
          {
            path: 'code',
            valueSet: 'example-valueset'
          }
        ]
      }
    }
  ],
  codes: []
};

const EXPECTED_DIAGNOSTICREPORT_DEFINITIONS: CQLResource = {
  definitions: [
    {
      name: 'ExampleDiagnosticReport',
      resourceType: 'DiagnosticReport',
      lookupName: 'ExampleDiagnosticReport Code',
      dataRequirement: {
        type: 'DiagnosticReport',
        codeFilter: [
          {
            path: 'code',
            code: [
              {
                code: '81247-9',
                system: 'http://loinc.org'
              }
            ]
          }
        ]
      }
    }
  ],
  codes: [
    {
      name: 'ExampleDiagnosticReport Code',
      code: '81247-9',
      system: 'http://loinc.org',
      dataRequirement: {
        type: 'DiagnosticReport',
        codeFilter: [
          {
            path: 'code',
            code: [
              {
                code: '81247-9',
                system: 'http://loinc.org'
              }
            ]
          }
        ]
      }
    }
  ]
};

test('test handler for Observation', () => {
  const resourceHandlerClass = handlerLookup['Observation'];
  const handler = new resourceHandlerClass(<R4.IStructureDefinition>exampleObservation, MOCK_VALUESET_MAP);
  expect(handler).toBeDefined();

  const result = handler!.process();
  expect(result).toEqual(EXPECTED_OBSERVATION_DEFINITIONS);
});

test('test handler for Condition', () => {
  const resourceHandlerClass = handlerLookup['Condition'];
  const handler = new resourceHandlerClass(<R4.IStructureDefinition>exampleCondition, MOCK_VALUESET_MAP);

  expect(handler).toBeDefined();

  const result = handler!.process();
  expect(result).toEqual(EXPECTED_CONDITION_DEFINITIONS);
});

test('test handler for Procedure', () => {
  const resourceHandlerClass = handlerLookup['Procedure'];
  const handler = new resourceHandlerClass(<R4.IStructureDefinition>exampleProcedure, MOCK_VALUESET_MAP);

  expect(handler).toBeDefined();

  const result = handler!.process();
  expect(result).toEqual(EXPECTED_PROCEDURE_DEFINITIONS);
});

test('test handler for Specimen', () => {
  const resourceHandlerClass = handlerLookup['Specimen'];
  const handler = new resourceHandlerClass(<R4.IStructureDefinition>exampleSpecimen, MOCK_VALUESET_MAP);

  expect(handler).toBeDefined();

  const result = handler!.process();
  expect(result).toEqual(EXPECTED_SPECIMEN_DEFINITIONS);
});

test('test handler for DiagnosticReport', () => {
  const resourceHandlerClass = handlerLookup['DiagnosticReport'];
  const handler = new resourceHandlerClass(<R4.IStructureDefinition>exampleDiagnosticReport, MOCK_VALUESET_MAP);

  expect(handler).toBeDefined();

  const result = handler!.process();
  expect(result).toEqual(EXPECTED_DIAGNOSTICREPORT_DEFINITIONS);
});
