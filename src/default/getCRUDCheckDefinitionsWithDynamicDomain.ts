import { ResolverResolveParams } from 'graphql-compose';
import { CRUDAction } from '..';
import { CheckDefinition } from '../plugins/CasbinGraphqlPlugin';

export const getCheckDefinitionsFromFilter = (
  resource: string,
  action: string,
  defaultDomain: string,
  getDomainFromFilter: (filter: any) => string | null | undefined
) => {
  const definition = {
    beforeResolve: (role: string, rp: ResolverResolveParams<any, any>) => {
      const domain = getDomainFromFilter(rp.args.filter);
      return [[role, domain || defaultDomain, resource, action]];
    },
  };

  return definition;
};

export const getCheckDefinitionsAfterResolve = (
  resource: string,
  action: string,
  defaultDomain: string,
  getDomainFromRecord: (
    record: any,
    rp: ResolverResolveParams<any, any>
  ) => string | null | undefined,
  multiple?: boolean
) => {
  const definition = {
    afterResolve: (
      role: string,
      result: any,
      rp: ResolverResolveParams<any, any>
    ) => {
      if (!multiple) {
        const domain = getDomainFromRecord(result, rp);
        return [[role, domain || defaultDomain, resource, action]];
      } else {
        const domains: string[] = result.map(
          (record) => getDomainFromRecord(record, rp) || defaultDomain
        );

        const uniqueDomains = new Set(domains);

        return [...uniqueDomains].map((domain) => [
          role,
          domain,
          resource,
          action,
        ]);
      }
    },
  };

  return definition;
};

export const getCheckDefinitionsBeforeRecordMutate = (
  resource: string,
  action: string,
  defaultDomain: string,
  getDomainFromRecord: (
    record: any,
    rp: ResolverResolveParams<any, any>
  ) => string | null | undefined
) => {
  const definition = {
    beforeRecordMutate: (
      role: string,
      doc: any,
      rp: ResolverResolveParams<any, any>
    ) => {
      const domain = getDomainFromRecord(doc, rp);
      return [[role, domain || defaultDomain, resource, action]];
    },
  };

  return definition;
};

const getCRUDCheckDefinitionsWithDynamicDomain = (
  resource: string,
  defaultDomain: string,
  getDomainFromRecord: (record: any) => string | null | undefined,
  getDomainFromFilter: (filter: any) => string | null | undefined
): { [key: string]: CheckDefinition } => {
  const getResolverName = (action: string) => `${resource}.${action}`;

  const definitions: { [key: string]: CheckDefinition } = {
    [getResolverName(CRUDAction.findById)]: getCheckDefinitionsAfterResolve(
      resource,
      CRUDAction.findById,
      defaultDomain,
      getDomainFromRecord
    ),
    [getResolverName(CRUDAction.findByIds)]: getCheckDefinitionsAfterResolve(
      resource,
      CRUDAction.findByIds,
      defaultDomain,
      getDomainFromRecord,
      true
    ),
    [getResolverName(CRUDAction.findOne)]: getCheckDefinitionsAfterResolve(
      resource,
      CRUDAction.findOne,
      defaultDomain,
      getDomainFromRecord
    ),
    [getResolverName(CRUDAction.findMany)]: getCheckDefinitionsFromFilter(
      resource,
      CRUDAction.findMany,
      defaultDomain,
      getDomainFromFilter
    ),
    [getResolverName(CRUDAction.count)]: getCheckDefinitionsFromFilter(
      resource,
      CRUDAction.count,
      defaultDomain,
      getDomainFromFilter
    ),
    [getResolverName(CRUDAction.connection)]: getCheckDefinitionsFromFilter(
      resource,
      CRUDAction.connection,
      defaultDomain,
      getDomainFromFilter
    ),
    [getResolverName(CRUDAction.pagination)]: getCheckDefinitionsFromFilter(
      resource,
      CRUDAction.pagination,
      defaultDomain,
      getDomainFromFilter
    ),
    [getResolverName(CRUDAction.createOne)]:
      getCheckDefinitionsBeforeRecordMutate(
        resource,
        CRUDAction.createOne,
        defaultDomain,
        getDomainFromRecord
      ),
    [getResolverName(CRUDAction.createMany)]:
      getCheckDefinitionsBeforeRecordMutate(
        resource,
        CRUDAction.createMany,
        defaultDomain,
        getDomainFromRecord
      ),
    [getResolverName(CRUDAction.updateById)]:
      getCheckDefinitionsBeforeRecordMutate(
        resource,
        CRUDAction.updateById,
        defaultDomain,
        getDomainFromRecord
      ),
    [getResolverName(CRUDAction.removeById)]:
      getCheckDefinitionsBeforeRecordMutate(
        resource,
        CRUDAction.removeById,
        defaultDomain,
        getDomainFromRecord
      ),
    [getResolverName(CRUDAction.removeMany)]: getCheckDefinitionsFromFilter(
      resource,
      CRUDAction.removeMany,
      defaultDomain,
      getDomainFromFilter
    ),
  };

  return definitions;
};

export default getCRUDCheckDefinitionsWithDynamicDomain;
