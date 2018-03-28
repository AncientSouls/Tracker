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

type TTracking =  ITracking<ITrackingItem, ITrackingEventsList>;

interface ITrackingItem {
  query: any;
  tracker: TTracker;
  tracking: TTracking;
}

interface ITracking
<ITE extends ITrackingItem, IEventsList extends ITrackingEventsList>
extends INode<IEventsList> {
  start(): Promise<void>;
  stop(): Promise<void>;

  fetch(query: any): Promise<any[]>;
  parse(document: any, index: number, query: any, tracker: TTracker): Promise<ITrackerItem>;

  trackings: { [id: string]: ITE };

  track(query: any): ITrackerStart;
  override(tracking: ITE): Promise<void>;
}

interface ITrackingEventTrackingData {
  tracking: TTracking;
  [key: string]: any;
}

interface ITrackingEventTrackerData extends ITrackingEventTrackingData {
  tracker?: TTracker;
  query?: any;
  data?: any;
}

interface ITrackingEventsList extends INodeEventsList {
  tracked: ITrackingEventTrackerData;
  untracked: ITrackingEventTrackerData;
  overrided: ITrackingEventTrackerData;
  started: ITrackingEventTrackingData;
  stopped: ITrackingEventTrackingData;
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

    track(query) {
      return async (tracker) => {
        const trackingItem = { query, tracker, tracking: this };
        this.items[tracker.id] = trackingItem;
        await this.override(trackingItem);
        this.emit('tracked', trackingItem);
        return async () => {
          delete this.items[tracker.id];
          this.emit('untracked', trackingItem);
        };
      };
    }
  
    async override(tracking) {
      const { query, tracker } = tracking;
      const records = await this.fetch(query);
      const data = await Promise.all(_.map(records, (d,i) => this.parse(d, i, query, tracker)));
      tracker.override(data);
      this.emit('overrided', tracking);
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
  ITrackingEventTrackerData,
  ITrackingEventTrackingData,
};
