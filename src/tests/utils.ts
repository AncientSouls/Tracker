import { assert } from 'chai';
import * as _ from 'lodash';

import { Database } from 'sqlite3';
const sqlite3 = require('sqlite3').verbose();

import {
  ITrackerItem,
  ITrackerStart,
} from '../lib/tracker';

import {
  TAsketicTracker,
  IAsketicTrackerAsk,
} from '../lib/asketic-tracker';

import {
  IQuery,
  IQueryResolver,
  asket,
} from 'ancient-asket/lib/asket';

import {
  Tracking,
  ITrackingItem,
} from '../lib/tracking';

const startDb = (): Promise<Database> => new Promise((resolver) => {
  const db = new sqlite3.Database(':memory:');
  db.serialize(() => {
    resolver(db);
  });
});

const stopDb = (db): Promise<void> => new Promise(resolve => db.close(() => resolve()));

const delay = (t): Promise<void> => new Promise(resolve => setTimeout(resolve, t));

const exec = (db, sql): Promise<void> => {
  return new Promise((resolve, reject) => db.exec(sql, (error, rows) => {
    if (error) reject(error);
    else resolve(rows);
  }));
};

const fetch = (db, sql): Promise<any[]> => {
  return new Promise((resolve, reject) => db.all(sql, (error, rows) => {
    if (error) reject(error);
    else resolve(rows);
  }));
};

class TestTracking extends Tracking {
  db: Database;
  interval: any;
  
  async start(db?: Database) {
    this.db = db;
    this.interval = setInterval(
      () => {
        _.each(this.items, (tracking) => {
          this.override(tracking);
        });
      },
      10,
    );
    await super.start();
  }

  async stop() {
    clearInterval(this.interval);
    await stopDb(this.db);
    await super.stop();
  }

  fetch(query) {
    return fetch(this.db, query);
  }
}

const newAsketicTrackerStart = (
  tracking: TestTracking,
  query: IQuery,
): IAsketicTrackerAsk => async (asketicTracker) => {
  const resolver = async (flow) => {
    if (flow.env.type === 'items') {
      return asketicTracker.resolveItemData(flow, flow.data.data);
    }

    if (flow.env.name === 'select') {
      const tracker = await asketicTracker.track(flow);
      
      const trackerAddedListener = item => items.splice(item.newIndex, 0, item);
      const sql = _.template(_.get(flow, 'schema.options.sql'))(_.get(flow, 'env.item.data'));
      tracker.init(tracking.track(sql));
      
      const items = [];
      tracker.on('added', trackerAddedListener);
      await tracker.subscribe();
      tracker.off('added', trackerAddedListener);

      return asketicTracker.resolveItemsArray(flow, items);
    }

    return asketicTracker.resolveDefault(flow);
  };
  
  return await asketicTracker.asket({
    query,
    resolver: asketicTracker.createResolver(resolver),
  });
};

export {
  TestTracking,
  delay,
  exec,
  fetch,
  startDb,
  newAsketicTrackerStart,
};
