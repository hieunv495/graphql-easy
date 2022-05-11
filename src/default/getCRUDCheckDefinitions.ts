import { CRUDAction } from '..';
import { CheckDefinition } from '../plugins/CasbinGraphqlPlugin';

const getCRUDCheckDefinitions = (
  resource: string
): { [key: string]: CheckDefinition } => {
  const getResolverName = (action: string) => `${resource}.${action}`;

  const getDef = (action: string) => ({
    beforeResolve: (role: string) => [[role, resource, action]],
  });

  const definitions: { [key: string]: CheckDefinition } = {
    [getResolverName(CRUDAction.findById)]: getDef(CRUDAction.findById),
    [getResolverName(CRUDAction.findByIds)]: getDef(CRUDAction.findByIds),
    [getResolverName(CRUDAction.findOne)]: getDef(CRUDAction.findOne),
    [getResolverName(CRUDAction.findMany)]: getDef(CRUDAction.findMany),
    [getResolverName(CRUDAction.count)]: getDef(CRUDAction.count),
    [getResolverName(CRUDAction.connection)]: getDef(CRUDAction.connection),
    [getResolverName(CRUDAction.pagination)]: getDef(CRUDAction.pagination),
    [getResolverName(CRUDAction.createOne)]: getDef(CRUDAction.createOne),
    [getResolverName(CRUDAction.createMany)]: getDef(CRUDAction.createMany),
    [getResolverName(CRUDAction.updateById)]: getDef(CRUDAction.updateById),
    [getResolverName(CRUDAction.removeById)]: getDef(CRUDAction.removeById),
    [getResolverName(CRUDAction.removeMany)]: getDef(CRUDAction.removeMany),
  };

  return definitions;
};

export default getCRUDCheckDefinitions;
