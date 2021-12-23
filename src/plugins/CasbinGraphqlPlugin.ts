import { Enforcer } from 'casbin';
import { GraphqlModuleContext, ModuleResolvers } from '../GraphqlModule';
import { GraphqlPlugin } from './@GraphqlPlugin';

export interface WrapResolverMapWithCasbinOptions<User> {
  enforcer: {
    current: null | Enforcer;
  };

  getUser: (context: any) => Promise<User | null | undefined>;
  getUserRole: (user: User | null | undefined) => Promise<string>;

  extraActionMap?: {
    [key: string]: string;
  };
  ignore?: string[];
}

export default class CasbinGraphqlPlugin<User> implements GraphqlPlugin {
  options: WrapResolverMapWithCasbinOptions<User>;
  constructor(options: WrapResolverMapWithCasbinOptions<User>) {
    this.options = options;
  }

  private wrapResolverWithCasbin(
    resolver: any,
    resource: string,
    action: string
  ) {
    const defaultResolve = resolver.resolve;
    resolver.resolve = async (...resolveParams) => {
      const context =
        resolveParams.length === 1
          ? resolveParams[0].context
          : resolveParams[2];

      const user = await this.options.getUser(context);

      const role = await this.options.getUserRole(user);

      const { req } = context;

      if (!this.options.enforcer.current) {
        throw new Error('Enforcer is not ready');
      }

      if (
        !(await this.options.enforcer.current.enforce(role, resource, action))
      ) {
        throw new Error(`Permission denied for '${resource}' - '${action}' `);
      }

      req.user = user;

      return defaultResolve(...resolveParams);
    };

    return resolver;
  }

  private getResolverAction(resolverName: string, resource: string): string {
    const bits = resolverName.split('.');

    // console.log(`ResolverName: ${resolverName}`);
    // console.log(`Prefix: ${prefix}`);
    // console.log(resolverName.startsWith(prefix));

    if (bits[0] === resource) {
      const action = bits[1];

      return action;
    } else {
      throw new Error(
        `Can not get action for resolver "${resolverName}" with resource "${resource}"`
      );
    }
  }

  private wrapResolverMapWithCasbin<T extends { [key: string]: any }>(
    resource: string,
    resolverMap: T,
    options?: WrapResolverMapWithCasbinOptions<User>
  ): T {
    const data: T = { ...resolverMap };

    for (const resolverName in data) {
      if (options?.ignore && options.ignore.includes(resolverName)) {
        continue;
      }

      if (options?.extraActionMap && resolverName in options.extraActionMap) {
        data[resolverName] = this.wrapResolverWithCasbin(
          data[resolverName],
          resource,
          options.extraActionMap[resolverName]
        );
        continue;
      }

      data[resolverName] = this.wrapResolverWithCasbin(
        data[resolverName],
        resource,
        this.getResolverAction(resolverName, resource)
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
    subscriptions: ModuleResolvers
  ): ModuleResolvers {
    return subscriptions;
    // return wrapResolverMapWithCasbin(
    //   context.resource,
    //   subscriptions,
    //   this.options
    // );
  }
}
