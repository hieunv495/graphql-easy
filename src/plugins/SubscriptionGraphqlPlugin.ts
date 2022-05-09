import { withFilter } from 'graphql-subscriptions';
import {
  GraphqlModuleContext,
  ModuleResolvers,
  ModuleSubscriptions,
} from '../GraphqlModule';
import { GraphqlPlugin } from './@GraphqlPlugin';
import { CRUDAction, CRUDGraphqlPlugin } from './CRUDGraphqlPlugin';

export const getCRUDEventMap = (resource: string) => {
  const actions = [
    CRUDAction.createOne,
    CRUDAction.createMany,
    CRUDAction.updateById,
    CRUDAction.removeById,
  ];
  const suffixMap: {
    [key in CRUDAction]?: string;
  } = {
    [CRUDAction.createOne]: 'Created',
    [CRUDAction.createMany]: 'CreatedMany',
    [CRUDAction.updateById]: 'Updated',
    [CRUDAction.removeById]: 'Removed',
  };

  const resolverNamePrefix = CRUDGraphqlPlugin.getResolverNamePrefix(resource);

  const eventMap: {
    [key in CRUDAction]?: string;
  } = {};

  for (const action of actions) {
    const resolverName = CRUDGraphqlPlugin.getResolverNameByAction(
      resource,
      action
    );
    const event = resolverNamePrefix + suffixMap[action];
    eventMap[resolverName] = event;
  }

  return eventMap;
};

export interface SubscriptionItem {
  event: string;
  filter?: (payload: any, variables: any) => boolean;
}

export const getCRUDSubscriptionItems = (resource: string) => {
  const eventMap = getCRUDEventMap(resource);
  const events = Object.values(eventMap);

  const subscriptionItems: { [key: string]: SubscriptionItem } = {};

  for (const event of events) {
    subscriptionItems[event] = { event };
  }
  return subscriptionItems;
};

export default class SubscriptionGraphqlPlugin implements GraphqlPlugin {
  eventMap: { [key: string]: string };
  subscriptionItems: {
    [key: string]: SubscriptionItem;
  };

  constructor({
    eventMap,
    subscriptionItems,
  }: {
    eventMap: { [key: string]: string };
    subscriptionItems: { [key: string]: SubscriptionItem };
  }) {
    this.eventMap = eventMap;
    this.subscriptionItems = subscriptionItems;
  }

  private wrapResolverWithEvent(event: string, resolver: any) {
    const defaultResolve = resolver.resolve;
    resolver.resolve = async (...resolveParams) => {
      const context =
        resolveParams.length === 1
          ? resolveParams[0].context
          : resolveParams[2];

      const { pubsub } = context;

      const result = await defaultResolve(...resolveParams);

      pubsub.publish(event, result);

      return result;
    };
    return resolver;
  }
  resolveQueries(
    context: GraphqlModuleContext,
    queries: ModuleResolvers
  ): ModuleResolvers {
    const newQueries: ModuleResolvers = { ...queries };

    for (const resolverName in queries) {
      const event = this.eventMap[resolverName];
      if (!event) {
        continue;
      }
      newQueries[resolverName] = this.wrapResolverWithEvent(
        event,
        queries[resolverName]
      );
    }

    return newQueries;
  }
  resolveMutations(
    context: GraphqlModuleContext,
    mutations: ModuleResolvers
  ): ModuleResolvers {
    const newMutations: ModuleResolvers = { ...mutations };

    for (const resolverName in mutations) {
      const event = this.eventMap[resolverName];
      if (!event) {
        continue;
      }
      newMutations[resolverName] = this.wrapResolverWithEvent(
        event,
        mutations[resolverName]
      );
    }

    return newMutations;
  }

  private getResolverByEvent(context: GraphqlModuleContext, event: string) {
    const resolverName = Object.keys(this.eventMap).find(
      (key) => this.eventMap[key] === event
    );
    if (!resolverName) {
      return;
    }
    const resolver =
      context.queries[resolverName] || context.mutations[resolverName];

    return resolver || undefined;
  }

  resolveSubscriptions(
    context: GraphqlModuleContext,
    subscriptions: ModuleSubscriptions
  ): ModuleSubscriptions {
    const newSubscriptions: ModuleSubscriptions = { ...subscriptions };

    for (const subscriptionName of Object.keys(this.subscriptionItems)) {
      const { event, filter } = this.subscriptionItems[subscriptionName];
      const resolver = this.getResolverByEvent(context, event);
      if (!resolver) {
        continue;
      }
      const type = resolver['type'] || resolver['getType']();
      if (!type) {
        continue;
      }

      let subscribe = (_parent, _args, context) =>
        context.pubsub.asyncIterator(event);
      if (filter) {
        subscribe = withFilter(subscribe, filter);
      }

      newSubscriptions[subscriptionName] = {
        type,
        resolve: (payload) => payload,
        subscribe,
      };
    }

    return newSubscriptions;
  }
}
