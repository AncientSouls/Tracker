import * as _ from 'lodash';

import {
  IntervalAdapter,
} from '../lib/interval-adapter';

import {
  Tracker,
} from '../lib/tracker';

import trackerTest, { delay } from './tracker-test';

export default () => {
  it('IntervalAdapter:', async () => {

    let results = [];

    class TestIntervalAdapter extends IntervalAdapter  {
      async fetch(item) {
        return _.cloneDeep((item.query ? results : _.reverse(results)).slice(2, 4));
      }
    }

    const adapter = new TestIntervalAdapter();
    const tracker = new Tracker();
    adapter.start({ interval: 1 });

    await trackerTest(
      adapter,
      tracker,
      1,
      0,
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
