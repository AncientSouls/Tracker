require('source-map-support').install();

import tracker from './tracker';
import trackerSqliteEqual from './tracker-sqlite-equal';
import asketicTracker from './asketic-tracker';

describe('AncientSouls/Tracker:', () => {
  tracker();
  trackerSqliteEqual();
  asketicTracker();
});
