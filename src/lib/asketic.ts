import * as _ from 'lodash';
import * as async from 'async';

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
  TTracker,
  ITrackerChanges,
} from './tracker';

import {
  TBundlePaths,
} from 'ancient-cursor/lib/bundle';

import {
  IQueryFlow,
} from 'ancient-asket/lib/asket';

export type TAsketic =  IAsketic<IAsketicEventsList>;

export interface IAsketicChange {
  changes: ITrackerChanges;
  path: TBundlePaths;
}

export type IAsketicChanges = IAsketicChange[];

export interface IAsketicEventsList extends INodeEventsList {
  getted: { changes: IAsketicChanges; asketic: TAsketic; };
  setted: { asketic: TAsketic; }[];
}

export interface IAsketic<IEventsList extends IAsketicEventsList> extends INode<IEventsList> {
  processing: boolean;
  waiting: { [id:string]: IQueryFlow; }[];

  getDataPath(path: IQueryFlow[]): any[];
  get(): Promise<IAsketicChanges>;
  set(flow: IQueryFlow);
  
  next(flow: IQueryFlow): Promise<IQueryFlow>;

  flowTracker(prevFlow: IQueryFlow, tracker: TTracker): Promise<IQueryFlow>;
  flowItems(prevFlow: IQueryFlow): IQueryFlow;
  flowItem(prevFlow: IQueryFlow): IQueryFlow;
  flowRoot(prevFlow: IQueryFlow): IQueryFlow;
  flowValue(prevFlow: IQueryFlow): IQueryFlow;
}

export function mixin<T extends TClass<IInstance>>(
  superClass: T,
): any {
  return class Asketic extends superClass {
    processing = false;
    waiting = [];

    getDataPath(path) {
      const result = [];
      let p;
      let actualIndex;
      for (p = 0; p < path.length; p++) {
        if (path[p].env.type === 'root') continue;
        else if (path[p].env.type === 'item') {
          actualIndex = path[p].env.tracker.indexes[path[p].env.item.id];
          if (typeof(actualIndex) !== 'number') return;
          result.push(actualIndex, path[p].key);
        } else result.push(path[p].key);
      }
      return result;
    }

    async get() {
      if (!this.processing) {
        this.processing = true;

        const waiting = this.waiting;
        this.waiting = [];
        const changes = [];
        
        let w;
        let f;
        for (w = waiting.length - 1; w >= 0; w--) {
          for (f in waiting[w]) {
            if (!waiting[w][f].env.tracker.isDestroyed) {
              const dataPath = this.getDataPath(waiting[w][f].path);
              if (dataPath) {
                const trackerChanges = await waiting[w][f].env.tracker.get(
                  async (change) => {
                    const result = await this.next({
                      ...waiting[w][f], data: change.item, path: [],
                    });
                    change.item = result.data;
                    return change;
                  },
                );
                if (trackerChanges.length) {
                  changes.push({
                    path: dataPath,
                    changes: trackerChanges,
                  });
                }
              }
            }
          }
        }

        this.processing = false;

        return changes;
      }

      this.emit('getted', {
        changes: [],
        asletic: this,
      });

      return [];
    }

    set(flow) {
      if (!this.waiting[flow.env.tracker.id]) {
        this.waiting[flow.env.path.length - 1] = this.waiting[flow.env.path.length - 1] || {};
        this.waiting[flow.env.path.length - 1][flow.env.tracker.id] = flow;
        this.emit('setted', { asketic: this });
      }
    }

    next(flow) {
      flow.env = flow.env || {};
      flow.env.path = flow.env.path || [];
      flow.env.type = flow.env.type || 'root';
      return flow.next(flow);
    }

    // flow generators

    async flowTracker(prevFlow, tracker) {
      const flow = this.flowItems(prevFlow);

      const parent = _.last(flow.env.path);
      flow.env.path = [...flow.env.path, flow];
      flow.env.tracker = tracker; // context of tracker

      await tracker.get();
      flow.data = tracker.current;

      tracker.on('setted', () => this.set(flow));

      if (flow.env.parentTracker) {
        flow.env.parentTracker.once('destroyed', () => {
          tracker.destroy();
        });
        flow.env.parentTracker.on('removed', ({ change: { id } }) => {
          if (id === flow.env.item.id) tracker.destroy();
        });
        flow.env.parentTracker.on('changed', ({ id }) => {
          if (id === flow.env.item.id) tracker.destroy();
        });
      }

      return flow;
    }
    flowItems(flow) {
      return {
        ...flow,
        env: {
          ...flow.env,
          type: 'items',
        },
      };
    }
    flowItem(flow) {
      return {
        ...flow,
        data: flow.data,
        env: {
          ...flow.env,
          type: 'item',
          item: flow.data,
        },
      };
    }
    flowRoot(flow) {
      return {
        ...flow,
        env: {
          ...flow.env,
          type: 'root',
        },
      };
    }
    flowValue(flow) {
      return {
        ...flow,
        env: {
          ...flow.env,
          type: 'value',
        },
      };
    }
  };
}

export const MixedAsketic: TClass<TAsketic> = mixin(Node);
export class Asketic extends MixedAsketic {}
