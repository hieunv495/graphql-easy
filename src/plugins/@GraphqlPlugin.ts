import { GraphqlModuleContext, ModuleResolvers } from '../GraphqlModule';

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
    subscriptions: ModuleResolvers
  ): ModuleResolvers;
}
