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

const fetchAndOverride = async (db, sql, tracker) => {
  const data = await fetch(db, sql);
  tracker.override(_.map(data, (d,i) => toItem(d,i,'id',tracker)));
};

const newTrackerStart = (
  db: Database,
  sql: string,
  time: number,
): ITrackerStart => {
  return async (tracker) => {
    const intervalHandler = async () => await fetchAndOverride(db, sql, tracker);
    const intervalToken = setInterval(intervalHandler, time);
    await fetchAndOverride(db, sql, tracker);
    return async () => {
      clearInterval(intervalToken);
    };
  };
};

const newAsketicTrackerStart = (
  db: Database,
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
      tracker.init(newTrackerStart(db, sql, 1));
      
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

const toItem = (data, newIndex, idField, tracker): ITrackerItem => {
  const id = data[idField];
  const oldVersion = tracker.memory[data[idField]];
  const isChanged = !_.isEqual(data, (oldVersion || {}));
  return {
    id, data, newIndex,
    tracker,
    memory: data,
    changed: isChanged,
  };
};

export {
  startDb,
  stopDb,
  delay,
  exec,
  fetch,
  fetchAndOverride,
  newTrackerStart,
  newAsketicTrackerStart,
  toItem,
};
