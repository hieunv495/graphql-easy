import {
  Resolver,
  ResolverFilterArgConfigDefinition,
  ResolverSortArgConfig,
} from 'graphql-compose';
import { ObjectTypeComposerWithMongooseResolvers } from 'graphql-compose-mongoose';
import {
  FilterHelperArgsOpts,
  SortHelperArgsOpts,
} from 'graphql-compose-mongoose/lib/resolvers/helpers';
import {
  GraphqlModuleContext,
  ModuleResolvers,
  ModuleSubscriptions,
} from '../GraphqlModule';
import { GraphqlPlugin } from './@GraphqlPlugin';

type TC = ObjectTypeComposerWithMongooseResolvers<any, any>;

export enum CRUDAction {
  findById = 'findById',
  findByIds = 'findByIds',
  findOne = 'findOne',
  findMany = 'findMany',
  count = 'count',
  connection = 'connection',
  pagination = 'pagination',
  createOne = 'createOne',
  createMany = 'createMany',
  updateById = 'updateById',
  removeById = 'removeById',
  removeMany = 'removeMany',
}

const QueryActions = [
  CRUDAction.findById,
  CRUDAction.findByIds,
  CRUDAction.findOne,
  CRUDAction.findMany,
  CRUDAction.count,
  CRUDAction.connection,
  CRUDAction.pagination,
];

const MutationActions = [
  CRUDAction.createOne,
  CRUDAction.createMany,
  CRUDAction.updateById,
  CRUDAction.removeById,
  CRUDAction.removeMany,
];

const ResolverMap: {
  [key in CRUDAction]?: (tc: TC, opts?: CRUDGraphqlPluginOptions) => Resolver;
} = {
  [CRUDAction.findById]: (tc: TC) => tc.mongooseResolvers.findById(),
  [CRUDAction.findByIds]: (tc: TC) => tc.mongooseResolvers.findByIds(),
  [CRUDAction.findOne]: (tc: TC, opts) =>
    tc.mongooseResolvers.findOne({
      filter: opts?.filter,
      sort: opts?.sort,
      suffix: 'Base',
    }),
  [CRUDAction.findMany]: (tc: TC, opts) =>
    tc.mongooseResolvers.findMany({
      filter: opts?.filter,
      sort: opts?.sort,
      suffix: 'Base',
    }),
  [CRUDAction.count]: (tc: TC, opts) =>
    tc.mongooseResolvers.count({
      filter: opts?.filter,
      suffix: 'Base',
    }),
  [CRUDAction.connection]: (tc: TC, opts) =>
    tc.mongooseResolvers.connection({
      findManyOpts: {
        filter: opts?.filter,
        sort: opts?.sort,
        suffix: 'Connection',
      },
    }),
  [CRUDAction.pagination]: (tc: TC, opts) =>
    tc.mongooseResolvers.pagination({
      findManyOpts: {
        filter: opts?.filter,
        sort: opts?.sort,
        suffix: 'Pagination',
      },
    }),
  [CRUDAction.createOne]: (tc: TC) => tc.mongooseResolvers.createOne(),
  [CRUDAction.createMany]: (tc: TC) => tc.mongooseResolvers.createMany(),
  [CRUDAction.updateById]: (tc: TC) => tc.mongooseResolvers.updateById(),
  [CRUDAction.removeById]: (tc: TC) => tc.mongooseResolvers.removeById(),
  [CRUDAction.removeMany]: (tc: TC) => tc.mongooseResolvers.removeMany(),
};

export interface CRUDGraphqlPluginOptions {
  includes?: CRUDAction[];
  excludes?: CRUDAction[];
  textSearch?: boolean;
  filter?: FilterHelperArgsOpts;
  filterArgs?: ResolverFilterArgConfigDefinition<any, any, any>[];
  sort?: SortHelperArgsOpts;
  sortArgs?: ResolverSortArgConfig<any, any, any>[];
}

export class CRUDGraphqlPlugin implements GraphqlPlugin {
  options?: CRUDGraphqlPluginOptions;

  constructor(options?: CRUDGraphqlPluginOptions) {
    this.options = options;
  }

  static getResolverNamePrefix(resource: string): string {
    const bits = resource.split('');
    bits[0] = bits[0].toLowerCase();
    const prefix = bits.join('');
    return prefix;
  }

  static getResolverNameByAction(resource: string, action: CRUDAction) {
    // return this.getResolverNamePrefix(resource) + SuffixMap[action];

    return `${resource}.${action}`;
  }

  static getSearchFilterArg(filterArgName: string) {
    return {
      name: filterArgName,
      type: 'String',
      query: (query, value, resolveParams) => {
        if (!value) return;
        resolveParams.args.sort = {
          score: { $meta: 'textScore' },
        };
        query.$text = { $search: value, $language: 'en' };
        resolveParams.projection.score = { $meta: 'textScore' };
      },
    };
  }

  resolveQueries(
    context: GraphqlModuleContext,
    queries: ModuleResolvers
  ): ModuleResolvers {
    const newQueries = { ...queries };
    let actions: CRUDAction[] = QueryActions;

    if (this.options?.includes) {
      actions = QueryActions.filter((action) =>
        this.options?.includes?.includes(action)
      );
    } else if (this.options?.excludes) {
      actions = QueryActions.filter(
        (action) => !this.options?.excludes?.includes(action)
      );
    }

    for (const action of actions) {
      let resolver = ResolverMap[action]?.(context.tc, this.options);
      if (!resolver) {
        continue;
      }
      if (
        [
          CRUDAction.findOne,
          CRUDAction.findMany,
          CRUDAction.count,
          CRUDAction.connection,
          CRUDAction.pagination,
        ].includes(action)
      ) {
        if (this.options?.textSearch) {
          resolver = resolver.addFilterArg(
            CRUDGraphqlPlugin.getSearchFilterArg('search')
          );
        }

        if (this.options?.filterArgs) {
          for (const arg of this.options.filterArgs) {
            resolver = resolver.addFilterArg(arg);
          }
        }
      }

      if (
        [
          CRUDAction.findMany,
          CRUDAction.connection,
          CRUDAction.pagination,
        ].includes(action)
      ) {
        if (this.options?.sortArgs) {
          for (const arg of this.options.sortArgs) {
            resolver.addSortArg(arg);
          }
        }
      }

      newQueries[
        CRUDGraphqlPlugin.getResolverNameByAction(context.resource, action)
      ] = resolver;
    }

    return newQueries;
  }
  resolveMutations(
    context: GraphqlModuleContext,
    mutations: ModuleResolvers
  ): ModuleResolvers {
    const newMutations = { ...mutations };
    let actions: CRUDAction[] = MutationActions;

    if (this.options?.includes) {
      actions = MutationActions.filter((action) =>
        this.options?.includes?.includes(action)
      );
    } else if (this.options?.excludes) {
      actions = MutationActions.filter(
        (action) => !this.options?.excludes?.includes(action)
      );
    }

    for (const action of actions) {
      const resolver = ResolverMap[action]?.(context.tc, this.options);
      if (!resolver) {
        continue;
      }
      newMutations[
        CRUDGraphqlPlugin.getResolverNameByAction(context.resource, action)
      ] = resolver;
    }

    return newMutations;
  }
  resolveSubscriptions(
    context: GraphqlModuleContext,
    subscriptions: ModuleSubscriptions
  ): ModuleSubscriptions {
    const newSubscriptions = { ...subscriptions };

    return newSubscriptions;
  }
}
