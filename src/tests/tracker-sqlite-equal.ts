import { assert } from 'chai';
import * as _ from 'lodash';

import { Database } from 'sqlite3';
const sqlite3 = require('sqlite3').verbose();

import { createIterator } from '../lib/tracker-sqlite-equal';
import { Tracker } from '../lib/tracker';

const delay = time => new Promise(resolve => setTimeout(resolve, time));

export default function () {
  describe('TrackerSqliteEqual:', () => {
    let db;

    const exec = sql => new Promise(res => db.exec(sql, res));

    before((done) => {
      db = new sqlite3.Database(':memory:');
      db.serialize(done);
    });
    after((done) => {
      setTimeout(() => db.close(done), 5);
    });
    beforeEach(async () => {
      await exec('create table if not exists test (key int, value int);');
      await exec('delete from test');
    });

    it('resubscribe() added', async () => {
      await exec(`insert into test (key,value) values ${_.times(9, t => `(${t + 1},${t + 1})`)};`);
      
      const { trackers, destroy, start } = createIterator(db,1);
      const tracker = new Tracker();

      const events = [];
      tracker.on('emit', ({ eventName }) => events.push(eventName));
      
      const query = {
        sql: `select * from test;`,
        idField: 'key',
      };
      const items = await tracker.resubscribe(query, start);

      await delay(5);

      assert.deepEqual(events, [
        ..._.times(9, () => 'added'),
      ]);
      assert.deepEqual(tracker.ids, [1,2,3,4,5,6,7,8,9]);
      assert.deepEqual(tracker.versions, {
        1: { changed: true, memory: { key: 1, value: 1 } },
        2: { changed: true, memory: { key: 2, value: 2 } },
        3: { changed: true, memory: { key: 3, value: 3 } },
        4: { changed: true, memory: { key: 4, value: 4 } },
        5: { changed: true, memory: { key: 5, value: 5 } },
        6: { changed: true, memory: { key: 6, value: 6 } },
        7: { changed: true, memory: { key: 7, value: 7 } },
        8: { changed: true, memory: { key: 8, value: 8 } },
        9: { changed: true, memory: { key: 9, value: 9 } },
      });

      await delay(5);
      
      destroy();
    });

    it('insert update delete', async () => {
      const { trackers, destroy, start } = createIterator(db,1);
      const tracker = new Tracker();

      const events = [];
      tracker.on('emit', ({ eventName }) => events.push(eventName));
      
      const query = {
        sql: `select * from test where value > 2 and value < 8 order by value asc limit 2;`,
        idField: 'key',
      };
      const items = await tracker.resubscribe(query, start);

      await exec(`insert into test (key,value) values ${_.times(9, t => `(${t + 1},${t + 1})`)};`);
      await delay(5);
      await exec(`update test set value = 10 where key = 3;`);
      await delay(5);
      await exec(`update test set value = 3 where key = 6;`);
      await delay(5);
      await exec(`update test set value = 3 where key = 4;`);
      await delay(5);
      await exec(`delete from test where key = 6;`);
      await delay(5);

      assert.deepEqual(events, [
        ..._.times(2, () => 'added'),
        'removed','added',
        'removed','added',
        'changed',
        'removed','added',
      ]);
      assert.deepEqual(tracker.ids, [4,5]);
      assert.deepEqual(tracker.versions, {
        5: { changed: true, memory: { key: 5, value: 5 } },
        4: { changed: true, memory: { key: 4, value: 3 } },
      });

      await delay(5);
      
      destroy();
    });
  });
}
