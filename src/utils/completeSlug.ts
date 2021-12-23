import { Model, Types } from 'mongoose';

const completeSlug = async (
  model: Model<any>,
  slug: string,
  id?: string | Types.ObjectId
) => {
  let newSlug = slug;
  let i = 2;
  while ((await model.count({ slug: newSlug, _id: { $ne: id } })) > 0) {
    newSlug = slug + '-' + i;
    i++;
  }

  return newSlug;
};

export default completeSlug;
