import * as _ from 'lodash';

import {
  TClass,
  IInstance,
} from 'ancient-mixins/lib/mixins';

import {
  Node,
  INode,
  INodeEventsList,
} from 'ancient-mixins/lib/node';

import {
  Tracker,
  ITrackerItem,
  ITrackerStart,
  TTracker,
} from './tracker';

import {
  IQuery,
  asket,
  IQueryResolver,
  IQueryFlow,
} from 'ancient-asket/lib/asket';

import {
  TAdapter,
  IAdapter,
  IAdapterEventsList,
  IAdapterItem,
  IAdapterClient,
} from '../lib/adapter';

export type TAsketicTracker =  IAsketicTracker<IAsketicTrackerEventsList>;

export interface IAsketicTrackerItem {
  asketicTracker: TAsketicTracker;
  item: ITrackerItem;
  result: any;
  path: string;
  flow: IQueryFlow;
}

export interface IAsketicTrackerTracking {
  asketicTracker: TAsketicTracker;
  tracker: TTracker;
  path: string;
  flow: IQueryFlow;
}

export interface IAsketicTrackerSubscribing {
  asketicTracker: TAsketicTracker;
  results?: any;
}

export interface IAsketicTrackerEventsList extends INodeEventsList {
  added: IAsketicTrackerItem;
  changed: IAsketicTrackerItem;
  removed: IAsketicTrackerItem;
  track: IAsketicTrackerTracking;
  tracked: IAsketicTrackerTracking;
  untrack: IAsketicTrackerTracking;
  untracked: IAsketicTrackerTracking;
  subscribed: IAsketicTrackerSubscribing;
  unsubscribed: IAsketicTrackerSubscribing;
}

export interface IAsketicTrackerAsk {
  (tracker: TTracker): Promise<any>;
}

export interface IAsketicTracker<IEventsList extends IAsketicTrackerEventsList>
extends INode<IEventsList> {
  trackerClass: TClass<TTracker>;
  isStarted: boolean;

  ask: IAsketicTrackerAsk;
  trackers: TTracker[];

  init(start?: ITrackerStart): this;

  resolveItemData(flow: IQueryFlow, data: any): IQueryFlow;
  resolveItemsArray(flow: IQueryFlow, items: ITrackerItem[]): IQueryFlow;
  resolveDefault(flow: IQueryFlow): IQueryFlow;

  watchTracker(tracker: TTracker, flow: IQueryFlow): void;

  track(flow?: IQueryFlow): TTracker;
  untrack(tracker: TTracker, flow?: IQueryFlow): Promise<void>;

  createResolver(resolver: IQueryResolver): IQueryResolver;
  asket(flow): Promise<IQueryFlow>;

  subscribe(): Promise<any>;
  unsubscribe(): Promise<void>;
}

export function mixin<T extends TClass<IInstance>>(
  superClass: T,
  trackerClass: T,
): any {
  return class AsketicTracker extends superClass {
    trackerClass = trackerClass;
    isStarted = false;
    trackers = [];
    
    init(ask) {
      if (this.isStarted) {
        throw new Error(`Started tracker ${this.id} cant be inited.`);
      }
      this.ask = ask;
    }

    resolveItemData(flow, data) {
      return {
        ...flow,
        data,
        env: {
          ...flow.env,
          item: flow.data,
          type: 'data',
          path: flow.env.nextPath,
        },
      };
    }

    resolveItemsArray(flow, items) {
      return {
        ...flow,
        data: items,
        env: {
          ...flow.env,
          type: 'items',
          path: flow.env.nextPath,
        },
      };
    }

    resolveItemsTracker(flow, tracker, adapter, query) {
      return this.resolveItemsArray(flow, wrapTracker(tracker, adapter, query));
    }

    resolveDefault(flow) {
      return {
        ...flow,
        env: {
          ...flow.env,
          type: 'query',
          path: flow.env.nextPath,
        },
      };
    }

    watchTracker(tracker, flow) {
      tracker.on('added', async (item) => {
        const itemPath = [...flow.env.nextPath, item.newIndex];
        const result = await this.asket({
          ...flow,
          query: { schema: flow.schema },
          data: item,
          env: {
            ...flow.env,
            type: 'items',
            path: itemPath,
          },
        });
        this.emit('added', {
          item, result, flow,
          asketicTracker: this,
          path: flow.env.nextPath,
        });
      });

      tracker.on('changed', async (item) => {
        const itemPath = [...flow.env.nextPath, item.newIndex];
        const result = await this.asket({
          ...flow,
          query: { schema: flow.schema },
          data: item,
          env: {
            ...flow.env,
            type: 'items',
            path: itemPath,
          },
        });
        this.emit('changed', {
          item, result, flow,
          asketicTracker: this,
          path: flow.env.nextPath,
        });
      });

      tracker.on('removed', (item) => {
        this.emit('removed', {
          item, flow,
          asketicTracker: this,
          path: flow.env.nextPath,
        });
      });

      if (flow.env.item) {
        const parent = flow.env.item.tracker;
        parent.on('destroyed', () => tracker.isStarted && this.untrack(tracker, flow));
        parent.on('removed', ({ id }) => {
          id === flow.env.item.id && this.untrack(tracker, flow);
        });
        parent.on('changed', ({ id }) => {
          id === flow.env.item.id && this.untrack(tracker, flow);
        });
      }
    }

    track(flow?) {
      const tracker = new this.trackerClass();
      this.trackers.push(tracker);
      tracker.once('subscribed', () => {
        this.emit('tracked', { flow, tracker, asketicTracker: this });
        this.watchTracker(tracker, flow);
      });
      this.emit('track', { flow, tracker, asketicTracker: this });
      return tracker;
    }

    async untrack(tracker, flow?) {
      this.emit('untrack', { flow, tracker, asketicTracker: this });
      await tracker.unsubscribe();
      _.remove(this.trackers, t => t === tracker);
      this.emit('untracked', { flow, tracker, asketicTracker: this });
      tracker.destroy();
    }

    async subscribe() {
      if (this.isStarted) {
        throw new Error(`Started asketic tracker ${this.id} cant be subscribed.`);
      }
      this.isStarted = true;

      const results = await this.ask(this);
      this.emit('subscribed', { results, asketicTracker: this });

      return results;
    }

    async unsubscribe() {
      if (!this.isStarted) {
        throw new Error(`Not started asketic tracker ${this.id} cant be unsubscribed.`);
      }
      this.isStarted = false;

      const trackers = _.map(this.trackers, t => this.untrack(t));
      await Promise.all(trackers);

      this.emit('unsubscribed', { asketicTracker: this });

      return this;
    }

    createResolver(resolver) {
      return (flow) => {
        flow.env.name = _.get(flow, 'schema.name');
        flow.env.nextPath = !_.isUndefined(flow.key) ? [...flow.env.path, flow.key] : flow.env.path;
        return resolver(flow);
      };
    }

    asket(flow) {
      return asket({
        ...flow,
        env: {
          item: null,
          path: [],
          type: 'query',
          ...flow.env,
        },
      });
    }
    
    destroy() {
      if (this.isStarted) {
        throw new Error(`Started asketic tracker ${this.id} cant be destroyed.`);
      }
      super.destroy();
    }
  };
}

export const MixedAsketicTracker: TClass<TAsketicTracker> = mixin(Node, Tracker);
export class AsketicTracker extends MixedAsketicTracker {}

export const wrapTracker = async (tracker, adapter, query) => {
  const trackerAddedListener = item => items.splice(item.newIndex, 0, item);
  tracker.init(adapter.track(query));
  
  const items = [];
  tracker.on('added', trackerAddedListener);
  await tracker.subscribe();
  tracker.off('added', trackerAddedListener);

  return items;
};
