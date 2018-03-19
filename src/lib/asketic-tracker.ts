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
  ITrackerEventItemData,
  ITrackingStart,
  TTracker,
} from './tracker';

import {
  IQuery,
  asket,
  IQueryResolver,
  IQueryFlow,
} from 'ancient-asket/lib/asket';

type TAsketicTracker =  IAsketicTracker<IAsketicTrackerEventsList>;

interface IAsketicTrackerEventItemData extends ITrackerEventItemData {
  path: string;
}
interface IAsketicTrackerEventTrackData extends ITrackerEventItemData {
  tracker: TTracker;
  path: string;
  flow: IQueryFlow;
}

interface IAsketicTrackerEventsList extends INodeEventsList {
  added: IAsketicTrackerEventItemData;
  changed: IAsketicTrackerEventItemData;
  removed: IAsketicTrackerEventItemData;
  tracked: IAsketicTrackerEventTrackData;
  untracked: IAsketicTrackerEventTrackData;
}

interface IAsketicTrackerResolverResult {
  tracker?: TTracker;
  data?: any[];
}

interface IAsketicTrackerResolver {
  (flow: IQueryFlow): Promise<IAsketicTrackerResolverResult>;
}

interface IAsketicTracker<IEventsList extends IAsketicTrackerEventsList>
extends INode<IEventsList> {
  trackerClass: TClass<TTracker>;

  resubscribe(
    query: IQuery,
    schemaResolver: IAsketicTrackerResolver,
  ): Promise<any>;
  unsubscribe(): Promise<void>;
}

function mixin<T extends TClass<IInstance>>(
  superClass: T,
  trackerClass: T,
): any {
  return class AsketicTracker extends superClass {
    constructor(...args: any[]) {
      super(...args);
      this.on('destroyed', () => this.unsubscribe());
    }
    trackerClass = trackerClass;
    queryResolver() {
      const resolver: IQueryResolver = flow => new Promise(async (resolve) => {
        if (!flow.data) {
          const { tracker, data } = await this.schemaResolver(flow);
          if (tracker && data) {
            const parent = flow.env.parent;
            const path = [...flow.env.path, flow.key];

            this.emit('tracked', { flow, tracker, path });

            this.on('unsubscribed', () => {
              tracker.destroy();
            });

            tracker.on('destroyed', () => {
              this.emit('untracked', { flow, tracker, path });
            });

            tracker.on('added', async ({
              id, changed, data, oldIndex, newIndex,
            }) => {
              const results = await asket({
                resolver, data,
                query: { schema: flow.schema },
                env: { ...flow.env, id, path: [...path, id] },
              });
              this.emit('added', {
                id, changed, oldIndex, newIndex, tracker,
                flow, path,
                data: results,
              });
            });

            tracker.on('changed', async ({
              id, changed, data, oldIndex, newIndex,
            }) => {
              const results = await asket({
                resolver, data,
                query: { schema: flow.schema },
                env: { ...flow.env, id, path: [...path, id] },
              });
              this.emit('changed', {
                id, changed, oldIndex, newIndex, tracker,
                flow, path,
                data: results,
              });
            });

            tracker.on('removed', async ({
              id, changed, oldIndex, newIndex,
            }) => {
              this.emit('removed', {
                id, changed, oldIndex, newIndex, tracker,
                flow, path,
              });
            });

            if (parent) {
              parent.on('destroyed', () => tracker.destroy());
              parent.on('removed', ({ id }) => id === flow.env.id && tracker.destroy());
              parent.on('changed', ({ id }) => id === flow.env.id && tracker.destroy());
            }

            return resolve({
              ...flow,
              data,
              env: {
                ...flow.env, path,
                parent: tracker,
              },
            });
          }
        }

        return resolve({
          ...flow,
          env: {
            ...flow.env,
            path: [...flow.env.path, flow.key],
          },
        });
      });

      return resolver;
    }
    async resubscribe(query, schemaResolver) {
      this.schemaResolver = schemaResolver;
      const data = await asket({
        query,
        resolver: this.queryResolver(),
        env: {
          id: null,
          parent: null,
          path: [],
          type: 'query',
        },
      });
      this.emit('subscribed', { data, tracker: this });
      return data;
    }

    unsubscribe() {
      this.emit('unsubscribed', { tracker: this });
    }
  };
}

const MixedAsketicTracker: TClass<TAsketicTracker> = mixin(Node, Tracker);
class AsketicTracker extends MixedAsketicTracker {}

export {
  mixin as default,
  mixin,
  MixedAsketicTracker,
  AsketicTracker,
  IAsketicTracker,
  IAsketicTrackerEventsList,
  TAsketicTracker,
  IAsketicTrackerEventItemData,
  IAsketicTrackerEventTrackData,
  IAsketicTrackerResolver,
  IAsketicTrackerResolverResult,
};
