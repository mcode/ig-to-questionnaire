const { Client } = require('cql-translation-service-client');
const config = require('../../config.json');

exports.convertBasicCQL = async (cql) => {
  const cqlTranslationClient = new Client(config.elmServiceURL);
  const elm = await cqlTranslationClient.convertBasicCQL(cql);
  const errorMessages = (elm.library && elm.library.annotation).filter((m) => m.errorSeverity === 'error');

  if (errorMessages.length > 0) {
    throw new Error(JSON.stringify(errorMessages));
  }

  return elm;
};
