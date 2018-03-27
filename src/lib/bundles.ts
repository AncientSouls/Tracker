import * as _ from 'lodash';

import {
  TAsketicTracker,
  IAsketicTracker,
  IAsketicTrackerEventsList,
  IAsketicTrackerItem,
} from '../lib/asketic-tracker';

import {
  IBundle,
  TBundlePaths,
} from 'ancient-cursor/lib/bundle';

interface ITrackerToBundlesCallback<IEventsList> {
  <IE extends keyof IEventsList>
  (bundles: IBundle[], eventName: IE, eventData: IEventsList[IE]): void;
}

const trackerToBundles = (
  tracker: TAsketicTracker,
  callback: ITrackerToBundlesCallback<IAsketicTrackerEventsList>,
): void => {
  tracker.on('added', (eventData) => {
    const { item, result, path } = eventData;
    callback(
      [{
        path, type: 'splice',
        deleteCount: 0, start: item.newIndex,
        values: [_.get(result, 'data')],
      }],
      'added',
      eventData,
    );
  });
  tracker.on('changed', (eventData) => {
    const { item, result, path } = eventData;
    const bundles = [];
    if (item.oldIndex !== item.newIndex) {
      bundles.push({ path, type: 'move', from: item.oldIndex, to: item.newIndex });
    }
    if (item.changed) {
      bundles.push({ path: [...path, item.newIndex], type: 'set', value: result.data });
    }
    callback(bundles, 'changed', eventData);
  });
  tracker.on('removed', (eventData) => {
    const { item, result, path } = eventData;
    callback(
      [{
        path, type: 'splice',
        deleteCount: 1, start: item.oldIndex,
        values: [],
      }],
      'removed',
      eventData,
    );
  });
  tracker.on('subscribed', (eventData) => {
    const { results } = eventData;
    callback(
      [{
        path: '', type: 'set',
        value: results.data,
      }],
      'subscribed',
      eventData,
    );
  });
};

export {
  trackerToBundles,
  TAsketicTracker,
  ITrackerToBundlesCallback,
};
