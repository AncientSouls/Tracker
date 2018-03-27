import { assert } from 'chai';
import * as _ from 'lodash';

import { AsketicTracker } from '../lib/asketic-tracker';

import {
  startDb,
  delay,
  exec,
  fetch,
  TestTracking,
  newAsketicTrackerStart,
} from './utils';

export default function () {
  describe('AsketicTracker:', () => {
    it('lifecycle', async () => {
      const t = new TestTracking();
      await t.start(await startDb());

      const tracker = new AsketicTracker();

      const query = {
        schema: {
          name: 'select',
          options: {
            sql: `select * from test where v > 2 and v < 8 order by v asc limit 2;`,
          },
          fields: {
            v: {},
            next: {
              name: 'select',
              options: {
                sql: `select * from test where v = <%= v+1 %>;`,
              },
              fields: {
                v: {},
              },
            },
          },
        },
      };

      tracker.init(newAsketicTrackerStart(t, query));

      await exec(t.db, `create table test (id integer primary key autoincrement, v integer);`);
      await exec(t.db, `insert into test (v) values ${_.times(9, t => `(${t + 1})`)};`);

      let results;
      tracker.on('added', ({ item, result, path }) => {
        _.get(results.data, path, results.data).splice(item.newIndex, 0, result.data);
      });
      tracker.on('changed', ({ item, result, path }) => {
        _.get(results.data, path, results.data).splice(item.oldIndex, 1);
        _.get(results.data, path, results.data).splice(item.newIndex, 0, result.data);
      });
      tracker.on('removed', ({ item, path }) => {
        _.get(results.data, path, results.data).splice(item.oldIndex, 1);
      });
      results = await tracker.subscribe();
      
      assert.deepEqual(results.data, _.times(2, t => ({
        v: t + 3,
        next: [{ v: t + 4 }],
      })));

      await exec(t.db, `update test set v = 6 where id = 3`);

      await delay(100);
      
      assert.deepEqual(results.data, _.times(2, t => ({
        v: t + 4,
        next: _.times(t ? 2 : 1, d => ({ v: t + 5 })),
      })));

      await exec(t.db, `update test set v = 7 where id = 6`);

      await delay(100);
      
      assert.deepEqual(results.data, _.times(2, t => ({
        v: t + 4,
        next: [{ v: t + 5 }],
      })));

      await tracker.unsubscribe();

      await delay(100);

      await t.stop();

      assert.deepEqual(tracker.trackers, []);
    });
  });
}
