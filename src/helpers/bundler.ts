import { R4 } from '@ahryman40k/ts-fhir-types';

export function bundlify(resources: R4.IResourceList[]): R4.IBundle {
  return {
    resourceType: 'Bundle',
    type: R4.BundleTypeKind._collection,
    entry: resources.map(r => ({
      resource: r
    }))
  };
}
