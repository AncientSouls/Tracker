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

type TTracker =  ITracker<ITrackerEventsList>;

type TIndex = number;
type TId = number|string;
type TVersion = number|string;

interface IItem {
  id: TId;
  version: TVersion;
  index: TIndex;
  data: any;
}

interface ITrackerEventsList extends INodeEventsList {
}

interface ITracker<IEventsList extends ITrackerEventsList> extends INode<IEventsList> {
}

function mixin<T extends TClass<IInstance>>(
  superClass: T,
): any {
  return class Tracker extends superClass {
    ids = [];
    versions = {};

    query = null;
    tracking: any;

    add(item) {
      const { id, version, index, data } = item;
      this.versions[id] = version;
      this.ids.splice(index, 0, id);

      const oldIndex = -1;
      const newIndex = index;

      this.emit('added', {
        id, version, data,
        oldIndex, newIndex,
        tracker: this,
      });
    }

    change(item) {
      const { id, version, index, data } = item;
      const oldIndex = this.ids.indexOf(id);
      const newIndex = index;

      if (oldIndex !== newIndex) {
        this.ids.splice(oldIndex, 1);
        this.ids.splice(newIndex, 0, id);
      } 
      
      this.versions[id] = version;

      this.emit('changed', {
        id, version, data,
        oldIndex, newIndex,
        tracker: this,
      });
    }

    remove(item) {
      const { id, version, index, data } = item;
      const oldIndex = this.ids.indexOf(id);
      const newIndex = -1;

      this.ids.splice(oldIndex, 1);
      delete this.versions[id];

      this.emit('removed', {
        id,
        oldIndex, newIndex,
        tracker: this,
      });
    }

    override(items) {
      const ids = _.map(items, (i: any) => i.id);
      const oldIds = _.difference(this.ids, ids);
      
      _.each(oldIds, (id) => {
        this.remove({ id });
      });
      _.each(items, (item) => {
        if (_.has(this.versions, item.id)) {
          if (
            item.version !== this.versions[item.id] ||
            item.index !== this.ids.indexOf(item.id)
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

    async resubscribe(query) {
      this.query = query;
      await this.unsubscribe();
    }
    async unsubscribe() {}
  };
}

const MixedTracker: TClass<ITracker<ITrackerEventsList>> = mixin(Node);
class Tracker extends MixedTracker {}

export {
  mixin as default,
  mixin,
  MixedTracker,
  Tracker,
  ITracker,
  ITrackerEventsList,
  TTracker,
  TIndex,
  TId,
  TVersion,
  IItem,
};
