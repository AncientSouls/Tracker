import * as _ from 'lodash';

import {
  DocsAdapter,
} from '../lib/docs-adapter';

import {
  Tracker,
} from '../lib/tracker';

import trackerTest from './tracker-test';

export default () => {
  it('DocsAdapter:', async () => {

    let results = [];

    let trackedItem;
    class TestDocsAdapter extends DocsAdapter  {
      async tracked(item) {
        trackedItem = item;
      }
      async fetch(item) {
        return (item.query ? results : _.reverse(results)).slice(2, 4);
      }
    }

    const adapter = new TestDocsAdapter();
    const tracker = new Tracker();
    adapter.start({});

    await trackerTest(
      adapter,
      tracker,
      1,
      0,
      async () => {
        results = _.times(6, i => ({ id: i + 1, num: i + 1 }));
        await adapter.override({ tracker, query: 1 });
      },
      async () => {
        results.push({ id: 9, num: 3 });
        results = _.sortBy(results, ['num','id']);

        await adapter.remove(4, { tracker, query: 1 });
        
        const _r = results.slice(2, 4);
        const i = _.findIndex(_r, { id: 9 });
        await adapter.add(_r[i], i, { tracker, query: 1 });
      },
      async () => {
        _.find(results, { id: 3 }).num = 5;
        results = _.sortBy(results, ['num','id']);

        await adapter.remove(3, { tracker, query: 1 });

        const _r = results.slice(2, 4);
        const i = _.findIndex(_r, { id: 4 });
        await adapter.add(_r[i], i, { tracker, query: 1 });
      },
      async () => {
        _.find(results, { id: 3 }).num = 6;
        results = _.sortBy(results, ['num','id']);
      },
      async () => {
        _.find(results, { id: 4 }).num = 3;
        results = _.sortBy(results, ['num','id']);

        const _r = results.slice(2, 4);
        const i = _.findIndex(_r, { id: 4 });
        await adapter.change(_r[i], i, { tracker, query: 1 });
      },
      async () => {
        _.remove(results, d => d.id === 4);
        results = _.sortBy(results, ['num','id']);

        await adapter.remove(4, { tracker, query: 1 });
        
        const _r = results.slice(2, 4);
        const i = _.findIndex(_r, { id: 5 });
        await adapter.add(_r[i], i, { tracker, query: 1 });
      },
    );

    await adapter.stop();
  });
};
