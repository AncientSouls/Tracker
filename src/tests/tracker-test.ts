import { assert } from 'chai';

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

export interface ITestResult {
  id: number;
  num: number;
}

export interface IO {
  (): Promise<any>;
}

export const delay = (t): Promise<void> => new Promise(resolve => setTimeout(resolve, t));

export default async (
  // sort by num,id
  adapter: TAdapter, // already started and stopping after
  tracker: TTracker,
  asc: any, // 12[(34)]56
  desc: any, // 63[(59)]21
  // [()]
  fill: IO, // 12[(34)]56
  insert9as3: IO, // 12[(39)]456
  change3to5: IO, // 12[(94)]356
  move3to6: IO, // 12[(94)]536
  move4to3: IO, // 12[(49)]536
  delete4: IO, // 12[(95)]36
) => {
  const events = [];
  tracker.on('emit', ({ eventName }) => events.push(eventName));

  tracker.init(adapter.track(asc));

  await tracker.subscribe();
  
  assert.deepEqual(tracker.ids, []);
  assert.deepEqual(tracker.memory, {
  });
  
  await fill();
  
  assert.deepEqual(tracker.ids, [3,4]);
  assert.deepEqual(tracker.memory, {
    3: { id: 3, num: 3 },
    4: { id: 4, num: 4 },
  });

  await insert9as3();
  
  assert.deepEqual(tracker.ids, [3,9]);
  assert.deepEqual(tracker.memory, {
    3: { id: 3, num: 3 },
    9: { id: 9, num: 3 },
  });

  await change3to5();
  
  assert.deepEqual(tracker.ids, [9,4]);
  assert.deepEqual(tracker.memory, {
    9: { id: 9, num: 3 },
    4: { id: 4, num: 4 },
  });

  await move3to6();
  
  assert.deepEqual(tracker.ids, [9,4]);
  assert.deepEqual(tracker.memory, {
    9: { id: 9, num: 3 },
    4: { id: 4, num: 4 },
  });

  await move4to3();
  
  assert.deepEqual(tracker.ids, [4,9]);
  assert.deepEqual(tracker.memory, {
    4: { id: 4, num: 3 },
    9: { id: 9, num: 3 },
  });

  await delete4();
  
  assert.deepEqual(tracker.ids, [9,5]);
  assert.deepEqual(tracker.memory, {
    9: { id: 9, num: 3 },
    5: { id: 5, num: 5 },
  });

  await tracker.unsubscribe();

  tracker.init(adapter.track(desc));

  await tracker.subscribe();
  
  assert.deepEqual(tracker.ids, [5,9]);
  assert.deepEqual(tracker.memory, {
    5: { id: 5, num: 5 },
    9: { id: 9, num: 3 },
  });

  await tracker.unsubscribe();
  tracker.destroy();
  
  assert.deepEqual(tracker.ids, [5,9]);
  assert.deepEqual(tracker.memory, {
    5: { id: 5, num: 5 },
    9: { id: 9, num: 3 },
  });

  tracker.clean();
  
  assert.deepEqual(tracker.ids, []);
  assert.deepEqual(tracker.memory, {});
  
  assert.deepEqual(events, [
    'subscribed',
    'added', 'added',
    'removed', 'added',
    'removed', 'added',
    'changed',
    'removed', 'added',
    'unsubscribed',
    'changed',
    'subscribed',
    'unsubscribed', 'destroyed',
  ]);
};
