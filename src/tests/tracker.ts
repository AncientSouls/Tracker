import { assert } from 'chai';
import * as _ from 'lodash';

import { Tracker } from '../lib/tracker';

export default function () {
  describe('Tracker:', () => {

    it('add() added', () => {
      const tracker = new Tracker();

      const events = [];
      tracker.on('emit', ({ eventName }) => events.push(eventName));

      tracker.once('added', (data) => {
        assert.deepEqual(data, {
          tracker, id: 1, version: 0, data: 1, oldIndex: -1, newIndex: 0,
        });
      });
      tracker.add({ id: 1, version: 0, index: 0, data: 1 });

      tracker.once('added', (data) => {
        assert.deepEqual(data, {
          tracker, id: 2, version: 0, data: 2, oldIndex: -1, newIndex: 1,
        });
      });
      tracker.add({ id: 2, version: 0, index: 1, data: 2 });

      tracker.once('added', (data) => {
        assert.deepEqual(data, {
          tracker, id: 3, version: 0, data: 3, oldIndex: -1, newIndex: 0,
        });
      });
      tracker.add({ id: 3, version: 0, index: 0, data: 3 });

      assert.deepEqual(events, ['added', 'added', 'added']);
      assert.deepEqual(tracker.ids, [3,1,2]);
      assert.deepEqual(tracker.versions, { 1:0, 2:0, 3:0 });
    });

    it('change() changed', () => {
      const tracker = new Tracker();

      tracker.add({ id: 1, version: 0, index: 0, data: 1 });
      tracker.add({ id: 2, version: 0, index: 1, data: 2 });
      tracker.add({ id: 3, version: 0, index: 0, data: 3 });

      const events = [];
      tracker.on('emit', ({ eventName }) => events.push(eventName));

      tracker.once('changed', (data) => {
        assert.deepEqual(data, {
          tracker, id: 1, version: 1, data: 4, oldIndex: 1, newIndex: 2,
        });
      });
      tracker.change({ id: 1, version: 1, index: 2, data: 4 });

      assert.deepEqual(events, ['changed']);
      assert.deepEqual(tracker.ids, [3,2,1]);
      assert.deepEqual(tracker.versions, { 1:1, 2:0, 3:0 });
    });

    it('remove() removed', () => {
      const tracker = new Tracker();

      tracker.add({ id: 1, version: 0, index: 0, data: 1 });
      tracker.add({ id: 2, version: 0, index: 1, data: 2 });
      tracker.add({ id: 3, version: 0, index: 0, data: 3 });

      const events = [];
      tracker.on('emit', ({ eventName }) => events.push(eventName));

      tracker.once('removed', (data) => {
        assert.deepEqual(data, {
          tracker, id: 1, oldIndex: 1, newIndex: -1,
        });
      });
      tracker.remove({ id: 1 });

      assert.deepEqual(events, ['removed']);
      assert.deepEqual(tracker.ids, [3,2]);
      assert.deepEqual(tracker.versions, { 2:0, 3:0 });
    });

    it('remove() removed', () => {
      const tracker = new Tracker();

      tracker.add({ id: 1, version: 0, index: 0, data: 1 });
      tracker.add({ id: 2, version: 0, index: 1, data: 2 });
      tracker.add({ id: 3, version: 0, index: 0, data: 3 });

      const events = [];
      tracker.on('emit', ({ eventName }) => events.push(eventName));

      tracker.once('removed', (data) => {
        assert.deepEqual(data, {
          tracker, id: 1, oldIndex: 1, newIndex: -1,
        });
      });
      tracker.remove({ id: 1 });

      assert.deepEqual(events, ['removed']);
      assert.deepEqual(tracker.ids, [3,2]);
      assert.deepEqual(tracker.versions, { 2:0, 3:0 });
    });

    it('override() removed changed added', () => {
      const tracker = new Tracker();

      tracker.add({ id: 1, version: 0, index: 0, data: 1 });
      tracker.add({ id: 2, version: 0, index: 1, data: 2 });
      tracker.add({ id: 3, version: 0, index: 0, data: 3 });

      const events = [];
      tracker.on('emit', ({ eventName }) => events.push(eventName));

      tracker.once('removed', (data) => {
        assert.deepEqual(data, {
          tracker, id: 1, oldIndex: 1, newIndex: -1,
        });
      });
      tracker.on('changed', (data) => {
        assert.deepEqual(data, {
          tracker, id: 2, version: 1, data: 5, oldIndex: 1, newIndex: 0,
        });
      });
      tracker.once('added', (data) => {
        assert.deepEqual(data, {
          tracker, id: 4, version: 0, data: 4, oldIndex: -1, newIndex: 2,
        });
      });
      tracker.override([
        { id: 2, version: 1, index: 0, data: 5 },
        { id: 3, version: 0, index: 1, data: 3 },
        { id: 4, version: 0, index: 2, data: 4 },
      ]);

      assert.deepEqual(events, ['removed','changed','added']);
      assert.deepEqual(tracker.ids, [2,3,4]);
      assert.deepEqual(tracker.versions, { 2:1, 3:0, 4:0 });
    });

    it('clean() removed', () => {
      const tracker = new Tracker();

      tracker.add({ id: 1, version: 0, index: 0, data: 1 });
      tracker.add({ id: 2, version: 0, index: 1, data: 2 });
      tracker.add({ id: 3, version: 0, index: 0, data: 3 });

      const events = [];
      tracker.on('emit', ({ eventName }) => events.push(eventName));

      tracker.clean();

      assert.deepEqual(events, ['removed','removed','removed']);
      assert.deepEqual(tracker.ids, []);
      assert.deepEqual(tracker.versions, {});
    });
  });
}
