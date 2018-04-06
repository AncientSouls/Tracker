import * as _ from 'lodash';

import {
  IntervalAdapter,
} from '../lib/interval-adapter';

import {
  Tracker,
} from '../lib/tracker';

import {
  IQuery,
  IQueryResolver,
  asket,
} from 'ancient-asket/lib/asket';

import {
  AsketicTracker,
} from '../lib/asketic-tracker';

import {
  delay,
} from './tracker-test';

import asketicTrackerTest, {
  query,
} from './asketic-tracker-test';

import {
  trackerToBundles,
} from '../lib/bundles';

import {
  Cursor,
} from 'ancient-cursor/lib/cursor';

export default () => {
  it('IntervalAsketicTracker:', async () => {
    const at = new AsketicTracker();

    let results = [];

    class TestIntervalAdapter extends IntervalAdapter  {
      async fetch(item) {
        const flow = item.query;
        if (flow.schema.options.query === 1) return _.cloneDeep(results.slice(2, 4));
        if (flow.schema.options.query === 2) {
          return _.cloneDeep(_.filter(results, r => r.num === flow.env.item.data.num));
        }
        throw new Error('wtf');
      }
    }

    const adapter = new TestIntervalAdapter();
    adapter.start({ interval: 1 });

    const resolver = async (flow) => {
      if (flow.env.type === 'root') {
        if (flow.name === 'query') {
          return await at.flowTracker(flow, new Tracker().init(adapter.track(flow)));
        }
      }
      if (flow.env.type === 'items') {
        return at.flowItem(flow);
      }
      if (flow.env.type === 'item') {
        if (flow.name === 'query') {
          return await at.flowTracker(flow, new Tracker().init(adapter.track(flow)));
        }
        return at.flowValue(flow);
      }
      throw new Error('wtf');
    };

    at.init({
      query,
      resolver,
    });

    const cursor = new Cursor();
    trackerToBundles(at, (bundles, event, e) => {
      _.each(bundles, b => cursor.apply(b));
    });

    const result = await at.subscribe();

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

    await adapter.stop();
  });
};
