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

type TTracking =  ITracking<INodeEventsList>;

interface ITrackingItem {
  query: any;
  tracker: TTracker;
}

interface ITracking<IEventsList extends INodeEventsList> extends INode<IEventsList> {
  start(): Promise<void>;
  stop(): Promise<void>;

  fetch(query: any): Promise<any[]>;
  parse(document: any, index: number, query: any, tracker: TTracker): Promise<ITrackerItem>;

  trackings: ITrackingItem[];

  track(query: any): ITrackerStart;
  override(tracking: ITrackingItem): Promise<void>;
}

function mixin<T extends TClass<IInstance>>(
  superClass: T,
): any {
  return class Tracking extends superClass {
    isStarted = false;

    async start() {
      this.isStarted = true;
    }

    async stop() {
      this.isStarted = false;
    }
    
    fetch(query): any[] {
      throw new Error('Method fetch must defined in this class!');
    }
    
    parse(document, index, query, tracker) {
      throw new Error('Method parse must defined in this class!');
    }

    trackings = [];

    track(query) {
      return async (tracker) => {
        const tracking = { query, tracker };
        this.trackings.push(tracking);
        this.override(tracking);
        return async () => _.remove(this.trackings, t => t.tracker === tracker);
      };
    }
  
    async override(traking) {
      const { query, tracker } = traking;
      const records = await this.fetch(query);
      const data = await Promise.all(_.map(records, (d,i) => this.parse(d, i, query, tracker)));
      tracker.override(data);
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
};
