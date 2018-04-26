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

export interface ITrackerChange {
  id: string;
  item: any;
  oldIndex: number;
  newIndex: number;
  changed?: boolean;
}

export type ITrackerChanges = ITrackerChange[];

export interface ITrackerChangeEvent {
  tracker: TTracker;
  change: ITrackerChange;
}

export interface ITrackerEventsList extends INodeEventsList {
  setted: { tracker: TTracker; current: any[]; update: any[]; };
  getted: { tracker: TTracker; current: any[]; update: any[]; changes: ITrackerChanges; };
  added: ITrackerChangeEvent;
  changed: ITrackerChangeEvent;
  removed: ITrackerChangeEvent;
}

export interface ITracker<IEventsList extends ITrackerEventsList> extends INode<IEventsList> {
  indexes: { [id: string]: number };
  current: any[];
  update?: any[];

  idField: string;

  isChanged(previous, current): boolean;
  set(update: any[]): void;
  get(handler?: (ITrackerChange) => ITrackerChange): Promise<ITrackerChanges>;
}

export function mixin<T extends TClass<IInstance>>(
  superClass: T,
): any {
  return class Tracker extends superClass {
    indexes = {};
    current = [];
    update;

    idField = '_id';

    set(update) {
      this.update = update;
      this.emit('setted', {
        tracker: this,
        current: this.current,
        update: this.update,
      });
    }

    isChanged(previous, current) {
      return !_.isEqual(previous, current);
    }

    fetch = () => {
      return this.update;
    }

    async get(handler) {
      const update = await this.fetch();

      if (_.isArray(update)) {
        const removed = [];
        const updated = [];

        const indexes = {};

        let i;
        let changed;
        for (i = 0; i < update.length; i++) {
          indexes[update[i][this.idField]] = i;
          if (_.has(this.indexes, update[i][this.idField])) {
            changed = this.isChanged(this.current[this.indexes[update[i][this.idField]]], update[i]);
            if (changed) {
              let change = {
                changed,
                id: '' + update[i][this.idField],
                item: update[i],
                oldIndex: this.indexes[update[i][this.idField]],
                newIndex: i,
              };
              if (handler) change = await handler(change);
              this.emit('changed', { change, tracker: this });
              updated.push(change);
            }
          } else {
            let change = {
              id: '' + update[i][this.idField],
              item: update[i],
              oldIndex: -1,
              newIndex: i,
            };
            if (handler) change = await handler(change);
            this.emit('added', { change, tracker: this });
            updated.push(change);
          }
        }

        let id;
        for (id in this.indexes) {
          if (!_.has(indexes, id)) {
            let change = {
              id: '' + id,
              item: this.current[this.indexes[id]],
              oldIndex: this.indexes[id],
              newIndex: -1,
            };
            if (handler) change = await handler(change);
            this.emit('removed', { change, tracker: this });
            removed.push(change);
          }
        }

        this.indexes = indexes;
        this.current = update;

        this.updated = undefined;
        
        const changes = [
          ...removed,
          ...updated,
        ];

        this.emit('getted', {
          changes,
          tracker: this,
          current: this.current,
          update: this.update,
        });
        
        return changes;
      }

      this.emit('getted', {
        changes: [],
        tracker: this,
        current: this.current,
        update: this.update,
      });

      return [];
    }
  };
}

export const MixedTracker: TClass<TTracker> = mixin(Node);
export class Tracker extends MixedTracker {}
