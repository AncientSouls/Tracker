import { assert } from 'chai';
import * as _ from 'lodash';
import { Database } from 'sqlite3';

import {
  toItem,
  getItems,
  createIterator as createIteratorEqual,
  IIteratorEqualFetch,
  IIteratorResult,
} from './tracker-iterator-equal';

import {
  TTracker,
} from './tracker';

const createFetch = (db: Database): IIteratorEqualFetch => (tracker: TTracker) => new Promise(
  resolve => db.all(_.get(tracker, 'query.sql'), (error, rows) => resolve(rows)),
);

const createIterator = (db: Database, time): IIteratorResult => {
  return createIteratorEqual(createFetch(db), time);
};

export {
  toItem,
  getItems,
  createIterator,
  createFetch,
};
