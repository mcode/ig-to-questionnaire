import { R4 } from '@ahryman40k/ts-fhir-types';

export class QuestionnaireBuilder {
  libraryName: string;
  questionnaire: R4.IQuestionnaire;

  constructor(libraryName: string) {
    this.libraryName = libraryName;
    this.questionnaire = {
      resourceType: 'Questionnaire',
      id: libraryName,
      title: libraryName,
      status: R4.QuestionnaireStatusKind._draft,
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/cqf-library',
          valueCanonical: `Library/${libraryName}`
        }
      ],
      item: []
    };
  }

  addCqfExpression(expression: string): void {
    this.questionnaire.item!.push({
      linkId: expression,
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/cqf-expression',
          valueExpression: {
            language: R4.ExpressionLanguageKind._textCql,
            expression: `"${this.libraryName}".${expression}`
          }
        }
      ],
      type: R4.Questionnaire_ItemTypeKind._choice
    });
  }
}
