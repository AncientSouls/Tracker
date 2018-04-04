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

export type TTracker =  ITracker<ITrackerEventsList>;

export interface ITrackerItem {
  id: string;
  data?: any;
  oldIndex?: number;
  newIndex?: number;
  memory?: any;
  changed?: boolean;
  tracker?: TTracker;
}

export interface ITrackerEventData {
  tracker?: TTracker;
}

export interface ITrackerEventsList extends INodeEventsList {
  added: ITrackerItem;
  changed: ITrackerItem;
  removed: ITrackerItem;
  subscribed: ITrackerEventData;
  unsubscribed: ITrackerEventData;
}

export interface ITrackerStop {
  (): Promise<void>;
}

export interface ITrackerStart {
  (tracker: TTracker): Promise<ITrackerStop>;
}

export interface ITracker<IEventsList extends ITrackerEventsList> extends INode<IEventsList> {
  ids: string[];
  memory: { [id: string]: any };
  isStarted: boolean;
  needUnsubscribe: boolean;

  start?: ITrackerStart;
  stop?: ITrackerStop;

  add(item: ITrackerItem): void;
  change(item: ITrackerItem): void;
  remove(item: ITrackerItem): void;

  override(items: ITrackerItem[]): void;
  clean(): void;

  init(start?: ITrackerStart): this;

  subscribe(): Promise<void>;
  unsubscribe(): Promise<void>;
}

export function mixin<T extends TClass<IInstance>>(
  superClass: T,
): any {
  return class Tracker extends superClass {
    ids = [];
    memory = {};
    isStarted = false;
    needUnsubscribe = false;

    start = null;
    stop = null;
    
    init(start) {
      if (this.isStarted) {
        throw new Error(`Started tracker ${this.id} cant be inited.`);
      }
      this.start = start;
    }

    async subscribe() {
      if (this.isStarted) {
        throw new Error(`Started tracker ${this.id} cant be subscribed.`);
      }
      this.stop = await this.start(this);
      this.isStarted = true;
      this.emit('subscribed', { tracker: this });
      if (this.needUnsubscribe) await this.unsubscribe();
    }

    async unsubscribe() {
      if (!this.isStarted) {
        this.needUnsubscribe = true;
      } else {
        this.isStarted = false;
        await this.stop();
        this.emit('unsubscribed', { tracker: this });
      }
    }

    add(item) {
      this.memory[item.id] = item.memory;
      this.ids.splice(item.newIndex, 0, item.id);

      item.oldIndex = -1;
      
      item.tracker = this;

      this.emit('added', item);
    }

    change(item) {
      item.oldIndex = this.ids.indexOf(item.id);

      if (item.oldIndex !== item.newIndex) {
        this.ids.splice(item.oldIndex, 1);
        this.ids.splice(item.newIndex, 0, item.id);
      }
      
      this.memory[item.id] = item.memory;

      item.tracker = this;

      this.emit('changed', item);
    }

    remove(item) {
      item.oldIndex = this.ids.indexOf(item.id);
      item.newIndex = -1;

      this.ids.splice(item.oldIndex, 1);
      delete this.memory[item.id];

      item.tracker = this;

      this.emit('removed', item);
    }

    override(items) {
      const ids = _.map(items, (i: any) => i.id);
      const oldIds = _.difference(this.ids, ids);
      
      _.each(oldIds, (id) => {
        this.remove({ id });
      });
      _.each(items, (item) => {
        if (_.has(this.memory, item.id)) {
          if (
            item.changed ||
            item.newIndex !== this.ids.indexOf(item.id)
          ) {
            this.change(item);
          }
        } else {
          this.add(item);
        }
      });
    }

    clean() {
      _.each(_.cloneDeep(this.ids), (id) => {
        this.remove({ id });
      });
    }

    destroy() {
      if (this.isStarted) {
        throw new Error(`Started tracker ${this.id} cant be destroyed.`);
      }
      super.destroy();
    }
  };
}

export const MixedTracker: TClass<TTracker> = mixin(Node);
export class Tracker extends MixedTracker {}
