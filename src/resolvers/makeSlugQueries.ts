import { Model } from 'mongoose';
import makeCheckSlug from './makeCheckSlug';
import makeFindBySlug from './makeFindBySlug';
import makeViewBySlug from './makeViewBySlug';

export default function makeSlugQueries(resource: string, model: Model<any>) {
  return {
    [`${resource}.checkSlug`]: makeCheckSlug({
      resource,
      model,
    }),
    [`${resource}.findBySlug`]: makeFindBySlug({
      resource,
      model,
    }),
    [`${resource}.viewBySlug`]: makeViewBySlug({
      resource,
      model,
    }),
  };
}
