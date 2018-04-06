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

export type TAdapter =  IAdapter<IAdapterClient, IAdapterItem, IAdapterEventsList<IAdapterItem>>;

export interface IAdapterItem {
  query: any;
  tracker: TTracker;
  adapter?: TAdapter;
  memory?: any;
}

export interface IAdapter<
  IC,
  ITE extends IAdapterItem,
  IEventsList extends IAdapterEventsList<IAdapterItem>,
>
extends INode<IEventsList> {
  client: IC;

  start(client: IC): Promise<any>;
  starting(): Promise<any>;
  stop(): Promise<any>;
  stoping(): Promise<any>;

  fetch(item: ITE): Promise<any[]>;

  getId(data: any): string;
  isChanged(id: any, data: any, item: ITE): boolean;
  parse(document: any, newIndex: number, item: ITE): Promise<ITrackerItem>;
  tracked(item): Promise<any>;
  untracked(item): Promise<any>;

  items: { [id: string]: ITE };

  track(query: any): ITrackerStart;
  override(item: ITE): Promise<any>;
}

export interface IAdapterEventsList<ITE extends IAdapterItem> extends INodeEventsList {
  tracked: ITE;
  untracked: ITE;
  overrided: ITE;
  started: ITE;
  stopped: ITE;
}

export interface IAdapterClient {
  [key: string]: any;
}

export function mixin<T extends TClass<IInstance>>(
  superClass: T,
): any {
  return class Adapter extends superClass {
    isStarted = false;
    public client;

    async start(client) {
      if (this.isStarted) {
        throw new Error(`Started adapter ${this.id} cant be started.`);
      }
      this.client = client;
      await this.starting();
      this.isStarted = true;
      this.emit('started', { adapter: this });
    }

    starting() {}

    async stop() {
      if (!this.isStarted) {
        throw new Error(`Not started adapter ${this.id} cant be stopped.`);
      }
      await this.stopping();
      this.isStarted = false;
      this.emit('stopped', { adapter: this });
    }

    stopping() {}
    
    async fetch(item): Promise<any[]> {
      throw new Error('Method fetch must defined in this class!');
    }

    getId(data) {
      return data.id;
    }

    isChanged(id, data, item) {
      const oldVersion = item.tracker.memory[id];
      return !_.isEqual(data, (oldVersion || {}));
    }
  
    async parse(data, newIndex, item) {
      const id = this.getId(data);
      const isChanged = this.isChanged(id, data, item);
      return {
        id, data, newIndex,
        tracker: item.tracker,
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
        const item = { query, tracker, adapter: this };
        this.items[tracker.id] = item;
        await this.override(item);
        await this.tracked(item);
        return async () => {
          delete this.items[tracker.id];
          await this.untracked(item);
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
        throw new Error(`Started adapter ${this.id} cant be destroyed.`);
      }
      super.destroy();
    }
  };
}

export const MixedAdapter: TClass<TAdapter> = mixin(Node);
export class Adapter extends MixedAdapter {}
