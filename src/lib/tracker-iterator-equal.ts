import { assert } from 'chai';
import * as _ from 'lodash';

import {
  TTracker,
  ITrackingGetItems,
  ITrackingStart,
  ITrackingStop,
  IItem,
} from './tracker';

interface IIteratorResult {
  getItems: ITrackingGetItems;
  start: ITrackingStart;
  trackers: TTracker[];
  destroy: () => void;
}

interface IIteratorEqualFetch {
  (tracker: TTracker): Promise<any[]>;
}

const toItem = (data, index, idField, tracker) => {
  const id = data[idField];
  const oldVersion = tracker.versions[data[idField]];
  const ch = !_.isEqual(data, (oldVersion || {}).memory);
  return {
    id,
    data,
    index,
    version: {
      memory: data,
      changed: ch,
    },
  };
};

const getItems = (fetch, tracker): Promise<any[]> => {
  return new Promise((resolve) => {
    tracker.query = tracker.query || {};
    let { idField } = tracker.query;
    idField = idField || 'id';
    fetch(tracker).then((data) => {
      const items = _.map(data, (d, i) => toItem(d, i, idField, tracker));
      resolve(items);
    });
  });
};

const createIterator = (
  fetch: IIteratorEqualFetch,
  time: number = 25,
): IIteratorResult => {
  const trackers = [];
  const interval = setInterval(
    () => _.each(trackers, async (tracker) => {
      tracker.override(await getItems(fetch, tracker));
    }),
    time,
  );
  const destroy = () => clearInterval(interval);
  const start: ITrackingStart = async (newTracker) => {
    const stop = () => {
      _.remove(trackers, tracker => tracker.id === newTracker.id);
    };
    stop();
    trackers.push(newTracker);
    return stop;
  };
  const get = tracker => getItems(fetch, tracker);
  return { trackers, destroy, start, getItems: get };
};

export {
  toItem,
  getItems,
  createIterator,
  IIteratorResult,
  IIteratorEqualFetch,
};
