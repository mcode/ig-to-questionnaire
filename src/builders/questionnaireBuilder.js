const { v4 } = require('uuid');

module.exports = class QuestionnaireBuilder {
  constructor() {
    this._resource = {
      resourceType: 'Questionnaire',
      id: v4(),
      status: 'draft',
      item: [],
    };
  }

  // TODO: Implement function for adding items to the questionnaire

  get resource() {
    return this._resource;
  }
};
