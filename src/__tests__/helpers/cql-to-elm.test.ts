import nock from 'nock';
import { convertBasicCQL } from '../../helpers/cql-to-elm';
import { elmServiceUrl } from '../../config.json';
import exampleElm from '../mock-ig/example-elm.json';

const MOCK_CQL = `
library example version '0.0.1'

using FHIR version '4.0.0'

codesystem "LOINC": 'http://loinc.org'

valueset "Cancer Disease Status Evidence Type Value Set": 'mcode-cancer-disease-status-evidence-type-vs'

code "CancerDiseaseStatus Code": '88040-1' from "LOINC"

define "CancerDiseaseStatus":
    [Observation: "CancerDiseaseStatus Code"]
`;

test('successfully queries translation service', async () => {
  nock(elmServiceUrl).post('/').reply(200, exampleElm);

  const elm = await convertBasicCQL(MOCK_CQL);
  expect(elm).toEqual(exampleElm);
});
