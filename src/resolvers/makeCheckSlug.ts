import { Model } from 'mongoose';

export interface MakeCheckSlugParams {
  resource: string;
  model: Model<any>;
}

const makeCheckSlug = ({ resource, model }: MakeCheckSlugParams) => ({
  args: {
    slug: 'String!',
  },
  type: `type ${resource}CheckSlugPayload {
      ok: Boolean!
  }`,

  resolve: async (
    _root: any,
    args: {
      slug: string;
    }
  ) => {
    const { slug } = args;
    const count = await model.count({ slug });
    if (count > 0) {
      return { ok: false };
    }
    return { ok: true };
  },
});

export default makeCheckSlug;
