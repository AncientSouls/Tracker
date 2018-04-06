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

export interface IAsketicTrackerFlowEnv {
  type: 'root' | 'item' | 'value';
  [key: string]: any;
}

export interface IAsketicTrackerFlow extends IQueryFlow {
  env: IAsketicTrackerFlowEnv;
}

export interface IAsketicTrackerItem {
  asketicTracker: TAsketicTracker;
  flow: IQueryFlow;
  result?: any;
  item?: ITrackerItem;
  path?: string[];
}

export interface IAsketicTrackerEventsList extends INodeEventsList {
  added: IAsketicTrackerItem;
  changed: IAsketicTrackerItem;
  removed: IAsketicTrackerItem;
  subscribe: IAsketicTrackerItem;
  subscribed: IAsketicTrackerItem;
  unsubscribe: IAsketicTrackerItem;
  unsubscribed: IAsketicTrackerItem;
}

export interface IAsketicTrackerAsk {
  (tracker: TTracker): Promise<any>;
}

export interface IAsketicTracker<IEventsList extends IAsketicTrackerEventsList>
extends INode<IEventsList> {
}

export function mixin<T extends TClass<IInstance>>(
  superClass: T,
  trackerClass: T,
): any {
  return class AsketicTracker extends superClass {
    public _flow;
    public isActive = false;
    public actions = [];

    init(flow) {
      if (this.isStarted) {
        throw new Error(`Started tracker ${this.id} cant be inited.`);
      }

      this._flow = flow;
    }

    async subscribe() {
      if (!_.isObject(this.flow)) {
        throw new Error(`Flow must be Asket TQueryFlow but: ${this.flow}`);
      }
      if (this.isStarted) {
        throw new Error(`Started asketic tracker ${this.id} cant be subscribed.`);
      }
      this.isStarted = true;

      this.emit('subscribe', { asketicTracker: this });

      const result = await this.asket(this.flowRoot(this._flow));

      this.emit('subscribed', { result, asketicTracker: this });

      return result;
    }

    async unsubscribe() {
      if (!this.isStarted) {
        throw new Error(`Not started asketic tracker ${this.id} cant be unsubscribed.`);
      }
      this.isStarted = false;

      this.emit('unsubscribe', { asketicTracker: this });

      const trackers = _.map(this.trackers, t => this.untrack(t));
      await Promise.all(trackers);

      this.emit('unsubscribed', { asketicTracker: this });

      return this;
    }

    asket(flow) {
      const resolver = flow.resolver;
      flow.resolver = async (flow) => {
        const f = await resolver(flow);
        return f;
      };
      return asket(flow);
    }

    getDataPath(path) {
      const result = [];
      let p;
      let actualIndex;
      for (p = 0; p < path.length; p++) {
        if (path[p].env.type === 'root') continue;
        else if (path[p].env.type === 'item') {
          actualIndex = path[p].env.tracker.ids.indexOf(path[p].env.item.id);
          result.push(actualIndex, path[p].key);
        } else result.push(path[p].key);
      }
      return result;
    }

    addAction(action) {
      this.actions.push(action);
      this.nextAction();
    }

    async nextAction() {
      if (!this.isActive && this.actions.length) {
        this.isActive = true;
        const action = this.actions.shift();
        await action();
        this.isActive = false;
        this.nextAction();
      }
    }

    flow(prevFlow) {
      return { ...prevFlow, env: { ...prevFlow.env } };
    }

    async flowTracker(prevFlow, tracker) {
      const flow = this.flowItems(prevFlow);

      const parentTracker = flow.env.tracker;
      flow.env.tracker = tracker; // context of tracker

      flow.data = []; // tracker items
      const trackerAddedListener = item => flow.data.splice(item.newIndex, 0, item);

      tracker.on('added', trackerAddedListener);
      await tracker.subscribe();
      tracker.off('added', trackerAddedListener);
      
      const flowItems = this.flowItems(flow);

      // watch childs changes

      tracker.on('added', (item) => {
        this.addAction(async () => {
          const flow = { ...flowItems, data: item, path: [] };
          const result = await this.asket(flow);
          this.emit('added', {
            item, result, flow, asketicTracker: this,
            path: this.getDataPath(flowItems.path),
          });
        });
      });

      tracker.on('changed', (item) => {
        this.addAction(async () => {
          const flow = { ...flowItems, data: item, path: [] };
          const result = await this.asket(flow);
          this.emit('changed', {
            item, result, flow, asketicTracker: this,
            path: this.getDataPath(flowItems.path),
          });
        });
      });

      tracker.on('removed', async (item) => {
        this.addAction(async () => {
          this.emit('removed', {
            item, flow, asketicTracker: this,
            path: this.getDataPath(flowItems.path),
          });
        });
      });

      // watch parent changes

      if (parentTracker) {
        parentTracker.once('destroyed', () => {
          if (tracker.isStarted) {
            tracker.unsubscribe();
            tracker.destroy();
          }
        });
        parentTracker.on('removed', ({ id }) => {
          if (tracker.isStarted && id === flow.env.item.id) {
            tracker.unsubscribe();
            tracker.destroy();
          }
        });
        parentTracker.on('changed', ({ id }) => {
          if (tracker.isStarted && id === flow.env.item.id) {
            tracker.unsubscribe();
            tracker.destroy();
          }
        });
      }

      return flowItems;
    }

    flowItems(prevFlow) {
      const flow = this.flow(prevFlow);
      flow.env.type = 'items';
      return flow;
    }

    flowRoot(prevFlow) {
      const flow = this.flow(prevFlow);
      flow.env.type = 'root';
      return flow;
    }

    flowItem(prevFlow) {
      const flow = this.flow(prevFlow);
      flow.env.item = flow.data; // context of item
      flow.data = flow.data.data; // unpack tracker item
      flow.env.type = 'item';
      return flow;
    }

    flowValue(prevFlow) {
      const flow = this.flow(prevFlow);
      flow.env.type = 'value';
      return flow;
    }
  };
}

export const MixedAsketicTracker: TClass<TAsketicTracker> = mixin(Node, Tracker);
export class AsketicTracker extends MixedAsketicTracker {}
