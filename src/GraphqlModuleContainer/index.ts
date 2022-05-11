import {
  GraphqlModule,
  ModuleResolvers,
  ModuleSubscriptions,
} from '../GraphqlModule';
export default class GraphqlModuleContainer {
  modules: GraphqlModule[];

  constructor({ modules }: { modules: GraphqlModule[] }) {
    this.modules = modules;
  }

  public getQueries(): ModuleResolvers {
    const queries: ModuleResolvers = {};

    for (const module of this.modules) {
      Object.assign(queries, module.getQueries());
    }

    return queries;
  }

  public getMutations(): ModuleResolvers {
    const mutations: ModuleResolvers = {};

    for (const module of this.modules) {
      Object.assign(mutations, module.getMutations());
    }
    return mutations;
  }

  public getSubscriptions(): ModuleSubscriptions {
    const subscriptions: ModuleResolvers = {};

    for (const module of this.modules) {
      Object.assign(subscriptions, module.getSubscriptions());
    }
    return subscriptions;
  }
}
