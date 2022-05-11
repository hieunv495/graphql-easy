import {
  GraphqlModuleContext,
  ModuleResolvers,
  ModuleSubscriptions,
} from '../GraphqlModule';

export interface GraphqlPlugin {
  resolveQueries(
    context: GraphqlModuleContext,
    queries: ModuleResolvers
  ): ModuleResolvers;

  resolveMutations(
    context: GraphqlModuleContext,
    mutations: ModuleResolvers
  ): ModuleResolvers;

  resolveSubscriptions(
    context: GraphqlModuleContext,
    subscriptions: ModuleSubscriptions
  ): ModuleSubscriptions;
}
