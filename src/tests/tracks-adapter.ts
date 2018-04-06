import * as _ from 'lodash';

import {
  TracksAdapter,
} from '../lib/tracks-adapter';

import {
  Tracker,
} from '../lib/tracker';

import trackerTest from './tracker-test';

export default () => {
  it('TracksAdapter:', async () => {

    let results = [];

    class TestTracksAdapter extends TracksAdapter  {
      async fetch(item) {
        if (!item.memory) item.memory = _.cloneDeep((item.query ? results : _.reverse(results)).slice(2, 4));
        return item.memory;
      }
    }

    const notify = async () => {
      const item = adapter.items[tracker.id];
      item.memory = (item.query ? results : _.reverse(results)).slice(2, 4);
      await adapter.override(item);
    };

    const adapter = new TestTracksAdapter();
    const tracker = new Tracker();
    adapter.start({});

    await trackerTest(
      adapter,
      tracker,
      1,
      0,
      async () => {
        results = _.times(6, i => ({ id: i + 1, num: i + 1 }));
        await notify();
      },
      async () => {
        results.push({ id: 9, num: 3 });
        results = _.sortBy(results, ['num','id']);
        await notify();
      },
      async () => {
        _.find(results, { id: 3 }).num = 5;
        results = _.sortBy(results, ['num','id']);
        await notify();
      },
      async () => {
        _.find(results, { id: 3 }).num = 6;
        results = _.sortBy(results, ['num','id']);
        await notify();
      },
      async () => {
        _.find(results, { id: 4 }).num = 3;
        results = _.sortBy(results, ['num','id']);
        await notify();
      },
      async () => {
        _.remove(results, d => d.id === 4);
        results = _.sortBy(results, ['num','id']);
        await notify();
      },
    );

    await adapter.stop();
  });
};
