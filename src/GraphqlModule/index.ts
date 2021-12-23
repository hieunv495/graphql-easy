import { ObjectTypeComposerFieldConfigDefinition } from 'graphql-compose';
import { ObjectTypeComposerWithMongooseResolvers } from 'graphql-compose-mongoose';
import { Model } from 'mongoose';
import { GraphqlPlugin } from '../plugins/@GraphqlPlugin';

export type ModuleResolvers = {
  [key: string]: ObjectTypeComposerFieldConfigDefinition<any, any>;
};

export interface GraphqlModuleContext {
  resource: string;
  model: Model<any>;
  tc: ObjectTypeComposerWithMongooseResolvers<any, any>;
  queries: ModuleResolvers;
  mutations: ModuleResolvers;
  subscriptions: ModuleResolvers;
}

export class GraphqlModule {
  resource: string;
  model: Model<any>;
  tc: ObjectTypeComposerWithMongooseResolvers<any, any>;
  queries: ModuleResolvers;
  mutations: ModuleResolvers;
  subscriptions: ModuleResolvers;

  plugins: GraphqlPlugin[];

  constructor({
    resource,
    model,
    tc,
    queries = {},
    mutations = {},
    subscriptions = {},
    plugins = [],
  }: {
    resource: string;
    model: Model<any>;
    tc: ObjectTypeComposerWithMongooseResolvers<any, any>;
    queries?: ModuleResolvers;
    mutations?: ModuleResolvers;
    subscriptions?: ModuleResolvers;
    plugins?: GraphqlPlugin[];
  }) {
    this.resource = resource;
    this.model = model;
    this.tc = tc;

    this.queries = queries;
    this.mutations = mutations;
    this.subscriptions = subscriptions;
    this.plugins = plugins;

    this.applyPlugins();
  }

  private applyPlugins() {
    for (const plugin of this.plugins) {
      const queries = plugin.resolveQueries(
        {
          resource: this.resource,
          model: this.model,
          tc: this.tc,
          queries: this.queries,
          mutations: this.mutations,
          subscriptions: this.subscriptions,
        },
        this.queries
      );
      const mutations = plugin.resolveMutations(
        {
          resource: this.resource,
          model: this.model,
          tc: this.tc,
          queries: this.queries,
          mutations: this.mutations,
          subscriptions: this.subscriptions,
        },
        this.mutations
      );

      const subscriptions = plugin.resolveSubscriptions(
        {
          resource: this.resource,
          model: this.model,
          tc: this.tc,
          queries: this.queries,
          mutations: this.mutations,
          subscriptions: this.subscriptions,
        },
        this.subscriptions
      );

      this.queries = queries;
      this.mutations = mutations;
      this.subscriptions = subscriptions;
    }
  }

  public getQueries() {
    return this.queries;
  }

  public getMutations() {
    return this.mutations;
  }

  public getSubscriptions() {
    return this.subscriptions;
  }
}
