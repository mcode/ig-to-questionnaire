import { R4 } from '@ahryman40k/ts-fhir-types';

export function bundlify(resources: Array<R4.IResource>): R4.IBundle {
  return {
    resourceType: 'Bundle',
    type: R4.BundleTypeKind._transaction,
    entry: resources
  };
}
