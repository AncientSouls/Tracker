import { assert } from 'chai';
import * as _ from 'lodash';
const chance = require('chance').Chance();

import { Tracker } from '../lib/tracker';
import { AsketicTracker } from '../lib/asketic-tracker';
import { toItem } from '../lib/tracker-sqlite-equal';

import { stress } from './stress';

const delay = time => new Promise(resolve => setTimeout(resolve, time));

export default function () {
  describe('AsketicTracker:', () => {
    it('asketic tracking static', async () => {
      const base = [];
      _.times(3, () => {
        base.push({ id: chance.fbid(), age: chance.age(), name: chance.name() });
      });

      const asketicTracker = new AsketicTracker();

      const events = [];
      asketicTracker.on('emit', ({ eventName }) => events.push(eventName));

      const results = await asketicTracker.resubscribe(
        {
          schema: {
            fields: {
              x: {
                name: 'query',
                fields: {
                  name: {},
                  y: {
                    name: 'query',
                    fields: {
                      age: {},
                    },
                  },
                },
              },
            },
          },
        },
        async (flow) => {
          if (_.get(flow, 'schema.name') === 'query') {
            const tracker = new Tracker();
            const items = await tracker.resubscribe(
              _.get(flow, 'schema.query'),
              async () => _.map(base, (b,i) => toItem(b,i, 'id', tracker)),
              async () => () => null,
            );
            const data = _.map(items, i => i.data);
            return { tracker, data };
          }
          return {};
        },
      );

      asketicTracker.destroy();
      
      assert.deepEqual(events, [
        'tracked',
        'tracked',
        'tracked',
        'tracked',
        'subscribed',
        'untracked',
        'untracked',
        'untracked',
        'untracked',
        'unsubscribed',
        'destroyed',
      ]);

      assert.deepEqual(
        results.data,
        {
          x: _.map(base, b => ({
            name: b.name,
            y: _.map(base, b => ({
              age: b.age,
            })),
          })),
        },
      );
    });

    it('asketic tracking events', async () => {
      const base = [];
      _.times(3, () => {
        base.push({ id: chance.fbid(), age: chance.age(), name: chance.name() });
      });

      const asketicTracker = new AsketicTracker();

      const events = [];
      asketicTracker.on('emit', ({ eventName }) => events.push(eventName));

      const trackers = [];
      const results = await asketicTracker.resubscribe(
        {
          schema: {
            fields: {
              x: {
                name: 'query',
                fields: {
                  name: {},
                  y: {
                    name: 'query',
                    fields: {
                      age: {},
                    },
                  },
                },
              },
            },
          },
        },
        async (flow) => {
          if (_.get(flow, 'schema.name') === 'query') {
            const tracker = new Tracker();
            const items = await tracker.resubscribe(
              _.get(flow, 'schema.query'),
              async () => _.map(base, (b,i) => toItem(b,i, 'id', tracker)),
              async (tracker) => {
                trackers.push(tracker);
                return () => _.remove(trackers, t => t.id === tracker.id);
              },
            );
            const data = _.map(items, i => i.data);
            return { tracker, data };
          }
          return {};
        },
      );

      assert.deepEqual(
        results.data,
        {
          x: _.map(base, b => ({
            name: b.name,
            y: _.map(base, b => ({
              age: b.age,
            })),
          })),
        },
      );

      const override = () => {
        _.each(trackers, tracker => tracker.override(
          _.map(base, (b,i) => toItem(b,i, 'id', tracker)),
        ));
      };

      const insert = async () => {
        await delay(5);
        base.push({ id: chance.fbid(), age: chance.age(), name: chance.name() });
        override();
      };
      const update = async (
        oldIndex = _.random(0, base.length - 1),
        newIndex = _.random(0, base.length - 1),
      ) => {
        await delay(5);
        base.splice(newIndex, 0, base.splice(oldIndex, 1)[0]);
        override();
      };
      const remove = async () => {
        await delay(5);
        const oldIndex = _.random(0, base.length - 1);
        base.splice(oldIndex, 1);
        override();
      };

      await insert();
      await insert();
      await update(4,2);
      await update(1,3);
      await delay(5);
      asketicTracker.destroy();
      await delay(5);

      assert.deepEqual(events, [
        ..._.times(4, () => 'tracked'),
        ..._.times(1, () => 'subscribed'),

        ..._.times(1, () => 'tracked'),
        ..._.times(4, () => 'added'),

        ..._.times(1, () => 'tracked'),
        ..._.times(5, () => 'added'),

        ..._.times(1, () => 'tracked'),
        ..._.times(6, () => 'changed'),

        ..._.times(2, () => 'tracked'),
        ..._.times(14, () => 'changed'),

        ..._.times(9, () => 'untracked'),
        ..._.times(1, () => 'unsubscribed'),
        ..._.times(1, () => 'destroyed'),
      ]);
    });
  });
}
