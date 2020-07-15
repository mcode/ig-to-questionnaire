import { R4 } from '@ahryman40k/ts-fhir-types';
import { createHandler } from '../../helpers/resourceHandlers';
import exampleObservation from '../mock-ig/site/StructureDefinition-example-observation.json';
import exampleCondition from '../mock-ig/site/StructureDefinition-example-condition.json';
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

test('test handler for Observation', () => {
  const handler = createHandler(<R4.IStructureDefinition>exampleObservation, MOCK_VALUESET_MAP);
  expect(handler).toBeDefined();

  const result = handler!.process();
  expect(result).toEqual(EXPECTED_OBSERVATION_DEFINITIONS);
});

test('test handler for Condition', () => {
  const handler = createHandler(<R4.IStructureDefinition>exampleCondition, MOCK_VALUESET_MAP);
  expect(handler).toBeDefined();

  const result = handler!.process();
  expect(result).toEqual(EXPECTED_CONDITION_DEFINITIONS);
});
