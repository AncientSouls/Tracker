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
  TTracker,
  ITrackerItem,
  ITrackerStart,
} from './tracker';

type TTracking =  ITracking<ITrackingItem, ITrackingEventsList<ITrackingItem>>;

interface ITrackingItem {
  query: any;
  tracker: TTracker;
  tracking: TTracking;
}

interface ITracking
<ITE extends ITrackingItem, IEventsList extends ITrackingEventsList<ITrackingItem>>
extends INode<IEventsList> {
  start(): Promise<void>;
  stop(): Promise<void>;

  fetch(item: ITE): Promise<any[]>;
  parse(document: any, index: number, item: ITE): Promise<ITrackerItem>;

  trackings: { [id: string]: ITE };

  track(query: any): ITrackerStart;
  override(tracking: ITE): Promise<void>;
}

interface ITrackingEventsList<ITE extends ITrackingItem> extends INodeEventsList {
  tracked: ITE;
  untracked: ITE;
  overrided: ITE;
  started: ITE;
  stopped: ITE;
}

function mixin<T extends TClass<IInstance>>(
  superClass: T,
): any {
  return class Tracking extends superClass {
    isStarted = false;

    async start() {
      if (this.isStarted) {
        throw new Error(`Started tracking ${this.id} cant be started.`);
      }
      this.isStarted = true;
      this.emit('started', { tracking: this });
    }

    async stop() {
      if (!this.isStarted) {
        throw new Error(`Not started tracking ${this.id} cant be stopped.`);
      }
      this.isStarted = false;
      this.emit('stopped', { tracking: this });
    }
    
    fetch(query): any[] {
      throw new Error('Method fetch must defined in this class!');
    }
  
    async parse(data, newIndex, { tracker }) {
      const id = data.id;
      const oldVersion = tracker.memory[data.id];
      const isChanged = !_.isEqual(data, (oldVersion || {}));
      return {
        id, data, newIndex,
        tracker,
        memory: data,
        changed: isChanged,
      };
    }

    items = {};

    tracked(item) {
      this.emit('tracked', item);
    }

    untracked(item) {
      this.emit('untracked', item);
    }

    track(query) {
      return async (tracker) => {
        const item = { query, tracker, tracking: this };
        this.items[tracker.id] = item;
        await this.override(item);
        this.tracked(item);
        return async () => {
          delete this.items[tracker.id];
          this.untracked(item);
        };
      };
    }
  
    async override(item) {
      const { query, tracker } = item;
      const records = await this.fetch(item);
      const data = await Promise.all(_.map(records, (d,i) => this.parse(d, i, item)));
      tracker.override(data);
      this.emit('overrided', item);
    }

    destroy() {
      if (this.isStarted) {
        throw new Error(`Started tracking ${this.id} cant be destroyed.`);
      }
      super.destroy();
    }
  };
}

const MixedTracking: TClass<TTracking> = mixin(Node);
class Tracking extends MixedTracking {}

export {
  mixin as default,
  mixin,
  MixedTracking,
  Tracking,
  ITracking,
  TTracking,
  ITrackingItem,
  ITrackingEventsList,
};
