import { R4 } from '@ahryman40k/ts-fhir-types';
import { bundlify } from '../../helpers/bundler';
import implementationGuide from '../mock-ig/site/ImplementationGuide.json';

test('function returns a valid collection bundle containing the resource', () => {
  const resourceList = [<R4.IImplementationGuide>implementationGuide];
  const bundle = bundlify(resourceList);

  expect(bundle.resourceType).toBe('Bundle');
  expect(bundle.entry).toContainEqual({ fullUrl: 'urn:uuid:example', resource: implementationGuide });
});
