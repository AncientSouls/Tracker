require('source-map-support').install();

import tracker from './tracker';
import asketicTracker from './asketic-tracker';
import asketicTrackerBundles from './asketic-tracker-bundles';

describe('AncientSouls/Tracker:', () => {
  tracker();
  asketicTracker();
  asketicTrackerBundles();
});
