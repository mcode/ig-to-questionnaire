import { Base64 } from 'js-base64';
import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import { R4 } from '@ahryman40k/ts-fhir-types';
import { ValueSetObject, ImplementationGuide, CQLResource, Library } from '../types/library-types';
import { QuestionnaireBuilder } from './questionnaireBuilder';
import { Handler, handlerLookup } from '../helpers/resourceHandlers';
import { logger } from '../helpers/logger';

const CODE_SYSTEMS: { [key: string]: string } = {
  'http://loinc.org': 'LOINC'
};

export class LibraryBuilder {
  igDir: string;
  ig: ImplementationGuide;
  valueSets: ValueSetObject[];
  resources: CQLResource[];
  fhirLibrary: R4.ILibrary;
  questionnaireBuilder: QuestionnaireBuilder;
  name: string;

  constructor(igDir: string, igJson: R4.IImplementationGuide, name: string) {
    this.igDir = igDir;
    this.name = name;
    this.ig = {
      json: igJson,
      name: this.name,
      version: igJson.version ?? '1.0.0',
      fhirVersion: '4.0.0' // FIXME: Hardcoding until translation supports 4.0.1
      //fhirVersion: igJson.fhirVersion![0]
    };
    this.valueSets = this.getValueSets();
    this.resources = this.getResources();
    this.fhirLibrary = {
      resourceType: 'Library',
      id: this.name,
      version: this.ig.version,
      type: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/library-type',
            code: 'logic-library'
          }
        ]
      },
      status: R4.LibraryStatusKind._draft,
      dataRequirement: [],
      content: []
    };
    this.questionnaireBuilder = new QuestionnaireBuilder(this.name);
  }

  getIdFromReference(r: R4.IReference): string {
    return r.reference?.split('/')[1] ?? '';
  }

  getExtensionByValueString(valueString: string): R4.IImplementationGuide_Resource[] {
    const RESOURCE_URL = 'http://hl7.org/fhir/tools/StructureDefinition/resource-information';
    const resources = this.ig.json.definition?.resource ?? [];
    return resources.filter(r => {
      return r.extension?.some(e => e.url === RESOURCE_URL && e.valueString === valueString);
    });
  }

  getValueSets(): ValueSetObject[] {
    logger.info('parsing ValueSets');
    const valueSetMap: ValueSetObject[] = [];
    const valueSetDefs = this.getExtensionByValueString('ValueSet');

    valueSetDefs.forEach(vs => {
      const vsId = this.getIdFromReference(vs.reference);
      logger.debug(`found ValueSet ${vsId}`);
      valueSetMap.push({ id: vsId, name: vs.name ?? vsId });
    });

    return valueSetMap;
  }

  getResources(): CQLResource[] {
    logger.info('parsing StructureDefinitions');
    const resources: CQLResource[] = [];
    const resourceDefs = this.getExtensionByValueString('StructureDefinition:resource');
    resourceDefs.forEach(r => {
      const resourceId = this.getIdFromReference(r.reference);
      const structureDef = JSON.parse(
        fs.readFileSync(path.join(this.igDir, `/StructureDefinition-${resourceId}.json`), 'utf8')
      );

      logger.debug(`generating CQL definitions for profile ${structureDef.name}`);

      if (structureDef.type in handlerLookup) {
        const resourceHandlerClass : typeof Handler = handlerLookup[structureDef.type];
        const resourceHandler: Handler = new resourceHandlerClass(structureDef, this.valueSets);
        resources.push(resourceHandler.process());
      }
      else if (structureDef.type !== 'Patient') {
          logger.warn(`No handling implemented for ${structureDef.type}. Skipping ${structureDef.name}`);
      }
    });
    return resources;
  }

  buildLibrary(): Library {
    logger.info('generating CQL string');
    const { name, version, fhirVersion } = this.ig;

    // Initialize cql with name and version of IG for the library
    let cql = `library ${name} version '${version}'\n\nusing FHIR version '${fhirVersion}'\n\n`;

    // Define all code systems first
    Object.entries(CODE_SYSTEMS).forEach(([url, systemName]) => {
      cql += `codesystem "${systemName}": '${url}'\n`;
    });

    cql += '\n';

    // Add valuesets based on map
    this.valueSets.forEach(vs => {
      cql += `valueset "${vs.name}": '${vs.id}'\n`;
    });

    // Define all codes
    _.flatten(this.resources.map(r => r.codes)).forEach(c => {
      cql += `\ncode "${c.name}": '${c.code}' from "${CODE_SYSTEMS[c.system]}"`;
    });

    cql += '\n';

    // Process defintions for all resources
    this.resources.forEach(r => {
      r.definitions.forEach(d => {
        cql += `\ndefine "${d.name}":\n\t[${d.resourceType}: "${d.lookupName}"]\n`;
        this.fhirLibrary.dataRequirement!.push(d.dataRequirement);
        this.questionnaireBuilder.addCqfExpression(d.name);
      });
    });

    this.fhirLibrary.content!.push({
      contentType: 'text/cql',
      data: Base64.encode(cql)
    });

    return {
      cql,
      resource: this.fhirLibrary,
      questionnaire: this.questionnaireBuilder.questionnaire
    };
  }
}
