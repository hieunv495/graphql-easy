import { schemaComposer } from 'graphql-compose';
import { Model } from 'mongoose';

export interface MakeMoveToPositionParams {
  resource: string;
  model: Model<any>;
  filter?: (source: any) => any;
  positionField?: string;
}

const makeMoveToPosition = ({
  resource,
  model,
  filter,
  positionField = 'position',
}: MakeMoveToPositionParams) =>
  schemaComposer.createResolver<any, { _id: string; position: number }>({
    name: `${resource}MoveToPosition`,
    type: `${resource}!`,
    args: {
      _id: 'MongoID!',
      position: 'Int!',
    },
    resolve: async ({ args: { _id, position } }) => {
      const target = await model.findById(_id);

      if (position === target[positionField]) {
        return target;
      }

      let filterObj: any = {};
      if (filter) {
        filterObj = filter(target);
      }

      filterObj['_id'] = {
        $ne: _id,
      };

      if (position < target[positionField]) {
        // up
        filterObj[positionField] = {
          $gte: position,
          $lte: target[positionField],
        };
      } else {
        // down
        filterObj[positionField] = {
          $gte: target[positionField],
          $lte: position,
        };
      }

      const action = {
        $inc: {
          [positionField]: position < target[positionField] ? 1 : -1,
        },
      };

      await model.updateMany(filterObj, action);

      target[positionField] = position;
      await target.save();

      return target;
    },
  });

export default makeMoveToPosition;
