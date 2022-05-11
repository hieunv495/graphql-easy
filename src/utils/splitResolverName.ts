export default function splitResolverName(resolverName: string): {
  resource: string;
  action: string;
} {
  const bits = resolverName.split('.');

  if (bits.length !== 2) {
    throw new Error('ResolverName format should be "resource.action"');
  }

  return {
    resource: bits[0],
    action: bits[1],
  };
}
