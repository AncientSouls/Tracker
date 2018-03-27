import { assert } from 'chai';
import * as _ from 'lodash';

import { Tracker } from '../lib/tracker';

import {
  TestTracking,
  delay,
  exec,
  fetch,
  startDb,
} from './utils';

export default function () {
  describe('Tracker:', () => {
    it('lifecycle', async () => {
      const t = new TestTracking();
      await t.start(await startDb());

      const tracker = new Tracker();

      const events = [];
      tracker.on('emit', ({ eventName }) => events.push(eventName));

      const s1 = `select * from test where v > 2 and v < 8 order by v asc limit 2`;
      const s2 = `select * from test where v > 2 and v < 8 order by v desc limit 2`;

      tracker.init(t.track(s1));

      await exec(t.db, `create table test (id integer primary key autoincrement, v integer);`);
      await exec(t.db, `insert into test (v) values ${_.times(9, t => `(${t + 1})`)};`);

      await tracker.subscribe();
      
      assert.deepEqual(tracker.ids, [3,4]);
      assert.deepEqual(tracker.memory, {
        3: { id: 3, v: 3 },
        4: { id: 4, v: 4 },
      });

      await exec(t.db, `update test set v = 6 where id = 3`);

      await delay(100);
      
      assert.deepEqual(tracker.ids, [4,5]);
      assert.deepEqual(tracker.memory, {
        4: { id: 4, v: 4 },
        5: { id: 5, v: 5 },
      });

      await exec(t.db, `update test set v = 3 where id = 5`);

      await delay(100);
      
      assert.deepEqual(tracker.ids, [5,4]);
      assert.deepEqual(tracker.memory, {
        4: { id: 4, v: 4 },
        5: { id: 5, v: 3 },
      });

      await exec(t.db, `update test set v = 5 where id = 5`);

      await delay(100);
      
      assert.deepEqual(tracker.ids, [4,5]);
      assert.deepEqual(tracker.memory, {
        4: { id: 4, v: 4 },
        5: { id: 5, v: 5 },
      });

      await tracker.unsubscribe();
      
      assert.deepEqual(tracker.ids, [4,5]);
      assert.deepEqual(tracker.memory, {
        4: { id: 4, v: 4 },
        5: { id: 5, v: 5 },
      });

      tracker.init(t.track(s2));

      await tracker.subscribe();
      
      assert.deepEqual(tracker.ids, [7,3]);
      assert.deepEqual(tracker.memory, {
        7: { id: 7, v: 7 },
        3: { id: 3, v: 6 },
      });

      await tracker.unsubscribe();
      tracker.destroy();
      
      assert.deepEqual(tracker.ids, [7,3]);
      assert.deepEqual(tracker.memory, {
        7: { id: 7, v: 7 },
        3: { id: 3, v: 6 },
      });

      tracker.clean();
      
      assert.deepEqual(tracker.ids, []);
      assert.deepEqual(tracker.memory, {});

      await delay(100);

      await t.stop();
      
      assert.deepEqual(events, [
        'added', 'added',
        'subscribed',
        'removed', 'added',
        'changed', 'changed', 'changed',
        'unsubscribed',
        'removed', 'removed',
        'added', 'added',
        'subscribed',
        'unsubscribed', 'destroyed',
      ]);
    });
  });
}
