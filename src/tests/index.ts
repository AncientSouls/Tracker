require('source-map-support').install();

import tracker from './tracker';
import trackerIteratorEqualSqlite from './tracker-iterator-equal-sqlite';
import asketicTracker from './asketic-tracker';

describe('AncientSouls/Tracker:', () => {
  tracker();
  trackerIteratorEqualSqlite();
  asketicTracker();
});
