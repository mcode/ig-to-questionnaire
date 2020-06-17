import { R4 } from '@ahryman40k/ts-fhir-types';

export function bundlify(resources: Array<R4.IResourceList>): R4.IBundle {
  return {
    resourceType: 'Bundle',
    type: R4.BundleTypeKind._transaction,
    entry: resources.map(r => ({
      resource: r,
      request: {
        method: R4.Bundle_RequestMethodKind._put,
        url: `${r.resourceType}/${r.id}`
      }
    }))
  };
}
