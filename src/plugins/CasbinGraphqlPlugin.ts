import { Enforcer } from 'casbin';
import { Resolver, ResolverResolveParams } from 'graphql-compose';
import {
  GraphqlModuleContext,
  ModuleResolvers,
  ModuleSubscriptions,
} from '../GraphqlModule';
import { GraphqlPlugin } from './@GraphqlPlugin';

export interface CheckDefinition {
  beforeResolve?: (
    role: string,
    rp: ResolverResolveParams<any, any>
  ) => string[][] | null | undefined;
  beforeRecordMutate?: (
    role: string,
    doc: any,
    rp: ResolverResolveParams<any, any>
  ) => string[][] | null | undefined;

  afterResolve?: (
    role: string,
    result: any,
    rp: ResolverResolveParams<any, any>
  ) => string[][] | null | undefined;
}

export interface WrapResolverMapWithCasbinOptions<User> {
  enforcer: {
    current: null | Enforcer;
  };

  getUser: (context: any) => Promise<User | null | undefined>;
  getUserRole: (user: User | null | undefined) => Promise<string>;

  checkDefinitions: { [key: string]: CheckDefinition };

  defaultCheckDefinition?: (resolverName: string) => CheckDefinition;

  ignore?: string[];
}

export default class CasbinGraphqlPlugin<User> implements GraphqlPlugin {
  options: WrapResolverMapWithCasbinOptions<User>;
  constructor(options: WrapResolverMapWithCasbinOptions<User>) {
    this.options = options;
  }

  private async enforce(rvalsList: string[][] | null | undefined) {
    if (rvalsList)
      for (const rvals of rvalsList) {
        if (
          rvals &&
          !(await this.options.enforcer.current?.enforce(...rvals))
        ) {
          throw new Error(`Permission denied for "${rvals.join(',')}"`);
        }
      }
  }

  private wrapResolverWithCasbin(
    resolver: Resolver,
    checkDefinition?: CheckDefinition
  ) {
    const { beforeResolve, beforeRecordMutate, afterResolve } =
      checkDefinition || {};

    resolver = resolver.wrapResolve((next) => async (rp) => {
      const context = rp.context;

      const user = await this.options.getUser(context);

      const role = await this.options.getUserRole(user);

      const { req } = context;

      if (!this.options.enforcer.current) {
        throw new Error('Enforcer is not ready');
      }

      req.user = user;

      if (beforeResolve) {
        const rvalsList: string[][] | undefined | null = beforeResolve(
          role,
          rp
        );
        await this.enforce(rvalsList);
      }

      if (beforeRecordMutate) {
        rp.beforeRecordMutate = async (doc, rp) => {
          const rvalsList: string[][] | undefined | null = beforeRecordMutate(
            role,
            doc,
            rp
          );
          await this.enforce(rvalsList);
          return doc;
        };
      }

      const result = await next(rp);

      if (afterResolve) {
        const rvalsList: string[][] | undefined | null = afterResolve(
          role,
          result,
          rp
        );
        await this.enforce(rvalsList);
      }

      return result;
    });

    return resolver;
  }

  private getResolverAction(resolverName: string, resource: string): string {
    const bits = resolverName.split('.');

    if (bits[0] === resource) {
      const action = bits[1];

      return action;
    } else {
      throw new Error(
        `Can not get action for resolver "${resolverName}" with resource "${resource}"`
      );
    }
  }

  private wrapResolverMapWithCasbin(
    resource: string,
    resolverMap: ModuleResolvers,
    options?: WrapResolverMapWithCasbinOptions<User>
  ): ModuleResolvers {
    const data: ModuleResolvers = { ...resolverMap };

    for (const resolverName in data) {
      if (options?.ignore && options.ignore.includes(resolverName)) {
        continue;
      }

      data[resolverName] = this.wrapResolverWithCasbin(
        data[resolverName],
        options?.checkDefinitions[resolverName] ||
          options?.defaultCheckDefinition?.(resolverName)
      );
    }

    return data;
  }

  resolveQueries(
    context: GraphqlModuleContext,
    queries: ModuleResolvers
  ): ModuleResolvers {
    return this.wrapResolverMapWithCasbin(
      context.resource,
      queries,
      this.options
    );
  }
  resolveMutations(
    context: GraphqlModuleContext,
    mutations: ModuleResolvers
  ): ModuleResolvers {
    return this.wrapResolverMapWithCasbin(
      context.resource,
      mutations,
      this.options
    );
  }
  resolveSubscriptions(
    context: GraphqlModuleContext,
    subscriptions: ModuleSubscriptions
  ): ModuleSubscriptions {
    return subscriptions;
  }
}
