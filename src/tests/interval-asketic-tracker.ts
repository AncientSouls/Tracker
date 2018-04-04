import { assert } from 'chai';
import * as _ from 'lodash';

import {
  IntervalAdapter,
} from '../lib/interval-adapter';

import {
  AsketicTracker,
} from '../lib/asketic-tracker';

import asketicTrackerTest, {
  query, starter, delay,
} from './asketic-tracker-test';

import {
  trackerToBundles,
} from '../lib/bundles';

import {
  Cursor,
} from 'ancient-cursor/lib/cursor';

export default function () {
  it('AsketicTracker:', async () => {
    const asketicTracker = new AsketicTracker();

    let results = [{ id: 4, num: 2 }];

    class TestIntervalAdapter extends IntervalAdapter  {
      async fetch(item) {
        const query = _.get(item.query, 'schema.options.query');
        const before = _.get(item.query, 'env.item.data');
        if (query === 1) return results.slice(2,4);
        if (query === 2) return _.filter(results, r => r.num = before.num + 1);
      }
    }

    const adapter = new TestIntervalAdapter();
    adapter.start({ interval: 1 });

    asketicTracker.init(starter(adapter));

    const cursor = new Cursor();
    trackerToBundles(asketicTracker, (bundles) => {
      _.each(bundles, b => cursor.apply(b));
    });
    
    await asketicTracker.subscribe();

    await asketicTrackerTest(
      cursor,
      async () => {
        results = _.times(6, i => ({ id: i + 1, num: i + 1 }));
        await delay(5);
      },
      async () => {
        results.push({ id: 9, num: 3 });
        results = _.sortBy(results, ['num','id']);
        await delay(5);
      },
      async () => {
        _.find(results, { id: 3 }).num = 5;
        results = _.sortBy(results, ['num','id']);
        await delay(5);
      },
      async () => {
        _.find(results, { id: 3 }).num = 6;
        results = _.sortBy(results, ['num','id']);
        await delay(5);
      },
      async () => {
        _.find(results, { id: 4 }).num = 3;
        results = _.sortBy(results, ['num','id']);
        await delay(5);
      },
      async () => {
        _.remove(results, d => d.id === 4);
        results = _.sortBy(results, ['num','id']);
        await delay(5);
      },
    );

    await asketicTracker.unsubscribe();

    await adapter.stop();
  });
}
