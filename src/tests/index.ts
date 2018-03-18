require('source-map-support').install();

import tracker from './tracker';
import trackerSqliteEqual from './tracker-sqlite-equal';

describe('AncientSouls/Tracker:', () => {
  tracker();
  trackerSqliteEqual();
});
