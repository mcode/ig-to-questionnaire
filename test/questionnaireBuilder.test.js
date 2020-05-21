const { Fhir } = require('fhir');
const QuestionnaireBuilder = require('../src/builders/questionnaireBuilder');

const fhir = new Fhir();

describe('test questionnaire building', () => {
  test('no items should be valid questionnaire', () => {
    const builder = new QuestionnaireBuilder();
    const { valid } = fhir.validate(builder.resource);
    expect(valid).toBe(true);
  });
});
