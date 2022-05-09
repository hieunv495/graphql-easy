import { CheckDefinition } from '../plugins/CasbinGraphqlPlugin';
import splitResolverName from '../utils/splitResolverName';

const getDefaultCheckDefinition =
  (domain?: string) =>
  (resolverName: string): CheckDefinition => {
    const { resource, action } = splitResolverName(resolverName);
    return {
      beforeResolve: (role) => {
        return domain
          ? [[role, domain, resource, action]]
          : [[role, resource, action]];
      },
    };
  };

export default getDefaultCheckDefinition;
