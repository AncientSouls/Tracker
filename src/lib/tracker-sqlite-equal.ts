import { assert } from 'chai';
import * as _ from 'lodash';
import { Database } from 'sqlite3';

import {
  TTracker,
  ITrackingStart,
  ITrackingStop,
  ITrackingResults,
  IItem,
} from './tracker';

interface IIteratorResult {
  start: ITrackingStart;
  trackers: TTracker[];
  destroy: () => void;
}

const getItems = (db, tracker): Promise<IItem[]> => {
  return new Promise((resolve) => {
    tracker.query = tracker.query || {};
    let { idField } = tracker.query;
    idField = idField || 'id';
    db.all(tracker.query.sql, (error, rows) => {
      const items = _.map(rows, (row, i) => {
        const id = row[idField];
        const oldVersion = tracker.versions[row[idField]];
        const ch = !_.isEqual(row, (oldVersion || {}).memory);
        return {
          id,
          version: {
            memory: row,
            changed: ch,
          },
          index: i,
          data: row,
        };
      });
      resolve(items);
      tracker.override(items);
    });
  });
};

const createIterator = (
  db: Database,
  time: number = 25,
): IIteratorResult => {
  const trackers = [];
  const interval = setInterval(
    () => _.each(trackers, tracker => getItems(db, tracker)),
    time,
  );
  const destroy = () => clearInterval(interval);
  const start: ITrackingStart = async (newTracker) => {
    const stop = () => {
      _.remove(trackers, tracker => tracker.id === newTracker.id);
    };
    stop();
    trackers.push(newTracker);
    const items = await getItems(db, newTracker);
    return { items, stop };
  };
  return { trackers, destroy, start };
};

export {
  getItems,
  createIterator,
  IIteratorResult,
};
