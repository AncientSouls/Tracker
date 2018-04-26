import * as _ from 'lodash';
import { assert } from 'chai';

import {
  Tracker,
} from '../lib/tracker';

import {
  Client,
} from '../lib/client';

export default () => {
  it('Client/Tracker:', async () => {
    const client = new Client();
    await client.start();
    
    const tracker = new Tracker();
    client.add(tracker);

    const events = [];
    tracker.on('added', ({ change: { id } }) => events.push(`added${id}`));
    tracker.on('changed', ({ change: { id } }) => events.push(`changed${id}`));
    tracker.on('removed', ({ change: { id } }) => events.push(`removed${id}`));

    assert.deepEqual(await tracker.get(), []);
    await tracker.set([
      { _id: 3, num: 3 },
      { _id: 4, num: 4 },
    ]);
    assert.deepEqual(await tracker.get(), [
      { id: '3', item: { _id: 3, num: 3 }, oldIndex: -1, newIndex: 0 },
      { id: '4', item: { _id: 4, num: 4 }, oldIndex: -1, newIndex: 1 },
    ]);
    await tracker.set([
      { _id: 3, num: 3 },
      { _id: 9, num: 3 },
    ]);
    assert.deepEqual(await tracker.get(), [
      { id: '4', item: { _id: 4, num: 4 }, oldIndex: 1, newIndex: -1 },
      { id: '9', item: { _id: 9, num: 3 }, oldIndex: -1, newIndex: 1 },
    ]);
    assert.deepEqual(await tracker.get(), []);
    await tracker.set([
      { _id: 9, num: 3 },
      { _id: 4, num: 4 },
    ]);
    await tracker.set([
      { _id: 4, num: 3 },
      { _id: 9, num: 3 },
    ]);
    await tracker.set([
      { _id: 9, num: 3 },
      { _id: 5, num: 5 },
    ]);
    assert.deepEqual(await tracker.get(), [
      { id: '3', item: { _id: 3, num: 3 }, oldIndex: 0, newIndex: -1 },
      { id: '5', item: { _id: 5, num: 5 }, oldIndex: -1, newIndex: 1 },
    ]);

    assert.deepEqual(events, [
      'added3','added4',
      'added9','removed4',
      'added5','removed3',
    ]);

    client.remove(tracker);
    await client.stop();
  });
};
