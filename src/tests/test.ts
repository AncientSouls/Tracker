import * as _ from 'lodash';
import { assert } from 'chai';

import {
  Tracker,
} from '../lib/tracker';

import {
  Client,
} from '../lib/client';

import {
  asket,
} from 'ancient-asket/lib/asket';

import {
  Asketic,
} from '../lib/asketic';

import {
  TCursor,
  ICursor,
  ICursorEventsList,
} from 'ancient-cursor/lib/cursor';

import {
  dataToBundle,
  asketicChangesToBundles,
} from '../lib/bundles';

export interface IO {
  (): Promise<any>;
}

export interface IData {
  a: { b: string; c: number; d: { b: string; }[] }[];
}

export const query = {
  schema: {
    name: 'a',
    options: {
      query: 1,
    },
    fields: {
      id: {},
      num: {},
      equal: {
        name: 'b',
        options: {
          query: 2,
        },
        fields: {
          id: {},
        },
      },
    },
  },
};

export const test = async (
  cursor: TCursor,
  fill: IO, // 12[(34)]56
  insert9as3: IO, // 12[(39)]456
  change3to5: IO, // 12[(94)]356
  move3to6: IO, // 12[(94)]536
  move4to3: IO, // 12[(49)]536
  delete4: IO, // 12[(95)]36
) => {
  assert.deepEqual(cursor.data, []);

  await fill();
  
  assert.deepEqual(cursor.data, [
    { id: 3, num: 3, equal: [{ id: 3 }] },
    { id: 4, num: 4, equal: [{ id: 4 }] },
  ]);
  
  await insert9as3();
  
  assert.deepEqual(cursor.data, [
    { id: 3, num: 3, equal: [{ id: 3 }, { id: 9 }] },
    { id: 9, num: 3, equal: [{ id: 3 }, { id: 9 }] },
  ]);

  await change3to5();
  
  assert.deepEqual(cursor.data, [
    { id: 9, num: 3, equal: [{ id: 9 }] },
    { id: 4, num: 4, equal: [{ id: 4 }] },
  ]);

  await move3to6();
  
  assert.deepEqual(cursor.data, [
    { id: 9, num: 3, equal: [{ id: 9 }] },
    { id: 4, num: 4, equal: [{ id: 4 }] },
  ]);

  await move4to3();
  
  assert.deepEqual(cursor.data, [
    { id: 4, num: 3, equal: [{ id: 4 }, { id: 9 }] },
    { id: 9, num: 3, equal: [{ id: 4 }, { id: 9 }] },
  ]);

  await delete4();
  
  assert.deepEqual(cursor.data, [
    { id: 9, num: 3, equal: [{ id: 9 }] },
    { id: 5, num: 5, equal: [{ id: 5 }] },
  ]);
};
