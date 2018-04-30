import * as _ from 'lodash';
import { assert } from 'chai';

import {
  Tracker,
} from '../lib/tracker';

import {
  Client,
} from '../lib/client';

import {
  asket,
} from 'ancient-asket/lib/asket';

import {
  Asketic,
} from '../lib/asketic';

import {
  dataToBundle,
  asketicChangesToBundles,
} from '../lib/bundles';

import {
  Cursor,
} from 'ancient-cursor/lib/cursor';

import { test, query } from './test';

const delay = async time => new Promise(res => setTimeout(res, time));

export default () => {
  it('Asketic:', async () => {
    const client = new Client();
    await client.start();

    // demo database
    let data = [];

    // in real life, db just notify each tracker by id
    // but here, we _update set new data in trackers manually
    const _update = (tracker) => {
      if (tracker.query.name === 'a') tracker.set(data.slice(2,4));
      if (tracker.query.name === 'b') {
        tracker.set(_.filter(data, r => r.num === tracker.query.env.item.num));
      }
    };

    // first trackers _update
    client.tracking = _update;

    const asketic = new Asketic();

    const flow = {
      query,
      next: asket,
      resolver: async (flow) => {
        if (flow.name === 'a' && flow.env.type === 'root') {
          const tracker = new Tracker();
          tracker.idField = 'id';
          tracker.query = flow;
          client.add(tracker);
          return asketic.flowTracker(flow, tracker);
        }
        if (flow.name === 'b' && flow.env.type === 'item') {
          const tracker = new Tracker();
          tracker.idField = 'id';
          tracker.query = flow;
          client.add(tracker);
          return asketic.flowTracker(flow, tracker);
        }
        // msut be writed in asketic compatibly resolver
        if (flow.env.type === 'items') return asketic.flowItem(flow);
        return asketic.flowValue(flow);
      },
    };

    const cursor = new Cursor();

    const result = await asketic.next(flow);
    // transform first asketic result to cursor bundle
    cursor.apply(dataToBundle(result.data));

    // just test db notifier emulator, _update each tracker and apply it to cursor
    const update = async (d) => {
      data = d;
      _.each(client.list.nodes, _update);
      const changes = await asketic.get();
      const bundles = asketicChangesToBundles(changes);
      _.each(bundles, bundle => cursor.apply(bundle));
    };
    
    await test(
      cursor,
      async () => {
        await update([
          { id: 1, num: 1 },
          { id: 2, num: 2 },
          { id: 3, num: 3 },
          { id: 4, num: 4 },
          { id: 5, num: 5 },
          { id: 6, num: 6 },
        ]);
      },
      async () => {
        await update([
          { id: 1, num: 1 },
          { id: 2, num: 2 },
          { id: 3, num: 3 },
          { id: 9, num: 3 },
          { id: 4, num: 4 },
          { id: 5, num: 5 },
          { id: 6, num: 6 },
        ]);
      },
      async () => {
        await update([
          { id: 1, num: 1 },
          { id: 2, num: 2 },
          { id: 9, num: 3 },
          { id: 4, num: 4 },
          { id: 3, num: 5 },
          { id: 5, num: 5 },
          { id: 6, num: 6 },
        ]);
      },
      async () => {
        await update([
          { id: 1, num: 1 },
          { id: 2, num: 2 },
          { id: 9, num: 3 },
          { id: 4, num: 4 },
          { id: 5, num: 5 },
          { id: 3, num: 6 },
          { id: 6, num: 6 },
        ]);
      },
      async () => {
        await update([
          { id: 1, num: 1 },
          { id: 2, num: 2 },
          { id: 4, num: 3 },
          { id: 9, num: 3 },
          { id: 5, num: 5 },
          { id: 3, num: 6 },
          { id: 6, num: 6 },
        ]);
      },
      async () => {
        await update([
          { id: 1, num: 1 },
          { id: 2, num: 2 },
          { id: 9, num: 3 },
          { id: 5, num: 5 },
          { id: 3, num: 6 },
          { id: 6, num: 6 },
        ]);
      },
    );
    
    asketic.destroy();
  });
};
