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

  fetch(query: any): Promise<any[]>;
  parse(document: any, index: number, query: any, tracker: TTracker): Promise<ITrackerItem>;

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
    
    parse(document, index, query, tracker) {
      throw new Error('Method parse must defined in this class!');
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
      const records = await this.fetch(query);
      const data = await Promise.all(_.map(records, (d,i) => this.parse(d, i, query, tracker)));
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
