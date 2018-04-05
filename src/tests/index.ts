require('source-map-support').install();

import intervalAdapter from './interval-adapter';
import docsAdapter from './docs-adapter';
import tracksAdapter from './tracks-adapter';

describe('AncientSouls/Tracker:', () => {
  describe('Adapter', () => {
    intervalAdapter();
    docsAdapter();
    tracksAdapter();
  });
});
