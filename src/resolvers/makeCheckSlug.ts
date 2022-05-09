import { schemaComposer } from 'graphql-compose';
import { Model } from 'mongoose';

export interface MakeCheckSlugParams {
  resource: string;
  model: Model<any>;
}

const makeCheckSlug = ({ resource, model }: MakeCheckSlugParams) =>
  schemaComposer.createResolver<any, { slug: string }>({
    name: resource + 'CheckSlug',
    args: {
      slug: 'String!',
    },
    type: `type ${resource}CheckSlugPayload {
      ok: Boolean!
  }`,

    resolve: async ({ args: { slug } }) => {
      const count = await model.count({ slug });
      if (count > 0) {
        return { ok: false };
      }
      return { ok: true };
    },
  });

export default makeCheckSlug;
