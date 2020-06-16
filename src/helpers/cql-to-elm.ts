import { Client } from 'cql-translation-service-client';
import { elmServiceUrl } from '../config.json';

interface ElmAnnotation {
  startLine: number;
  startChar: number;
  endLine: number;
  endChar: number;
  message: string;
  errorType: string;
  errorSeverity: string;
  type: string;
}

export async function convertBasicCQL(cql: string): Promise<any> {
  const cqlTranslationClient = new Client(elmServiceUrl);
  const elm: any = await cqlTranslationClient.convertBasicCQL(cql);
  const errorMessages = (elm.library && elm.library.annotation).filter(
    (m: ElmAnnotation) => m.errorSeverity === 'error'
  );

  if (errorMessages.length > 0) {
    throw new Error(JSON.stringify(errorMessages));
  }

  return elm;
}
