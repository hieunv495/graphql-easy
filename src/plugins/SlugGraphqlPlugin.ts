import { GraphqlModuleContext, ModuleResolvers } from '../GraphqlModule';
import makeSlugMutations from '../resolvers/makeSlugMutations';
import makeSlugQueries from '../resolvers/makeSlugQueries';
import { GraphqlPlugin } from './@GraphqlPlugin';

export class SlugGraphqlPlugin implements GraphqlPlugin {
  resolveQueries(
    { resource, model }: GraphqlModuleContext,
    queries: ModuleResolvers
  ): ModuleResolvers {
    const newQueries = {
      ...queries,
      ...makeSlugQueries(resource, model),
    };
    return newQueries;
  }
  resolveMutations(
    { resource, model, tc }: GraphqlModuleContext,
    mutations: ModuleResolvers
  ): ModuleResolvers {
    const newMutations = {
      ...mutations,
      ...makeSlugMutations(resource, model, tc),
    };

    return newMutations;
  }
  resolveSubscriptions(
    _context: GraphqlModuleContext,
    subscriptions: ModuleResolvers
  ): ModuleResolvers {
    return subscriptions;
  }
}
