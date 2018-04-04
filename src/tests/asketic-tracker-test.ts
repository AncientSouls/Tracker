import { assert } from 'chai';
import * as _ from 'lodash';

import {
  TAdapter,
  IAdapter,
  IAdapterEventsList,
  IAdapterItem,
  IAdapterClient,
} from '../lib/adapter';

import {
  TTracker,
  ITracker,
  ITrackerEventsList,
} from '../lib/tracker';

import {
  IQuery,
  IQueryResolver,
  asket,
} from 'ancient-asket/lib/asket';

import {
  TAsketicTracker,
  IAsketicTrackerAsk,
} from '../lib/asketic-tracker';

import {
  TCursor,
  ICursor,
  ICursorEventsList,
} from 'ancient-cursor/lib/cursor';

export interface ITestResult {
  id: number;
  num: number;
}

export interface IO {
  (): Promise<any>;
}

export const query = {
  schema: {
    name: 'query',
    options: {
      query: 1,
    },
    fields: {
      id: {},
      num: {},
      next: {
        name: 'query',
        options: {
          query: 2,
        },
        fields: {
          num: {},
        },
      },
    },
  },
};

export const starter = adapter => async (asketicTracker) => {
  const resolver = async (flow) => {
    if (flow.env.name === 'query') {
      const tracker = await asketicTracker.track(flow);
      return asketicTracker.resolveItemsTracker(flow, tracker, adapter, flow);
    }

    if (flow.env.type === 'items') {
      return asketicTracker.resolveItemData(flow, _.get(flow, 'data.data'));
    }

    return asketicTracker.resolveDefault(flow);
  };
  
  return await asketicTracker.asket({
    query,
    resolver: asketicTracker.createResolver(resolver),
  });
};

export const delay = (t): Promise<void> => new Promise(resolve => setTimeout(resolve, t));

export default async (
  // sort by num,id
  cursor: TCursor,
  // [()]
  fill: IO, // 12[(3{4}4{5})]56
  insert9as3: IO, // 12[(3{9}9{4})]456
  change3to5: IO, // 12[(9{4}4{3})]356
  move3to6: IO, // 12[(9{4}4{5})]536
  move4to3: IO, // 12[(4{9}9{5})]536
  delete4: IO, // 12[(9{5}5{3})]36
) => {
  console.log(cursor.data);
//   await asketicTracker.subscribe();
  
//   assert.deepEqual(asketicTracker.ids, []);
//   assert.deepEqual(asketicTracker.memory, {
//   });
  
//   await fill();
  
//   assert.deepEqual(asketicTracker.ids, [3,4]);
//   assert.deepEqual(asketicTracker.memory, {
//     3: { id: 3, num: 3 },
//     4: { id: 4, num: 4 },
//   });

//   await insert9as3();
  
//   assert.deepEqual(asketicTracker.ids, [3,9]);
//   assert.deepEqual(asketicTracker.memory, {
//     3: { id: 3, num: 3 },
//     9: { id: 9, num: 3 },
//   });

//   await change3to5();
  
//   assert.deepEqual(asketicTracker.ids, [9,4]);
//   assert.deepEqual(asketicTracker.memory, {
//     9: { id: 9, num: 3 },
//     4: { id: 4, num: 4 },
//   });

//   await move3to6();
  
//   assert.deepEqual(asketicTracker.ids, [9,4]);
//   assert.deepEqual(asketicTracker.memory, {
//     9: { id: 9, num: 3 },
//     4: { id: 4, num: 4 },
//   });

//   await move4to3();
  
//   assert.deepEqual(asketicTracker.ids, [4,9]);
//   assert.deepEqual(asketicTracker.memory, {
//     4: { id: 4, num: 3 },
//     9: { id: 9, num: 3 },
//   });

//   await delete4();
  
//   assert.deepEqual(asketicTracker.ids, [9,5]);
//   assert.deepEqual(asketicTracker.memory, {
//     9: { id: 9, num: 3 },
//     5: { id: 5, num: 5 },
//   });

//   await asketicTracker.unsubscribe();

//   asketicTracker.init(adapter.track(desc));

//   await asketicTracker.subscribe();
  
//   assert.deepEqual(asketicTracker.ids, [5,9]);
//   assert.deepEqual(asketicTracker.memory, {
//     5: { id: 5, num: 5 },
//     9: { id: 9, num: 3 },
//   });

//   await asketicTracker.unsubscribe();
//   asketicTracker.destroy();
  
//   assert.deepEqual(asketicTracker.ids, [5,9]);
//   assert.deepEqual(asketicTracker.memory, {
//     5: { id: 5, num: 5 },
//     9: { id: 9, num: 3 },
//   });

//   asketicTracker.clean();
  
//   assert.deepEqual(asketicTracker.ids, []);
//   assert.deepEqual(asketicTracker.memory, {});
  
//   assert.deepEqual(events, [
//     'subscribed',
//     'added', 'added',
//     'removed', 'added',
//     'removed', 'added',
//     'changed',
//     'removed', 'added',
//     'unsubscribed',
//     'changed',
//     'subscribed',
//     'unsubscribed', 'destroyed',
//   ]);
};
