require('source-map-support').install();

import intervalAdapter from './interval-adapter';
import docsAdapter from './docs-adapter';
import tracksAdapter from './tracks-adapter';

import intervalAsketicTracker from './interval-asketic-tracker';

describe('AncientSouls/Tracker:', () => {
  describe('Adapter', () => {
    intervalAdapter();
    docsAdapter();
    tracksAdapter();
  });
  describe('AsketicTracker', () => {
    intervalAsketicTracker();
  });
});
