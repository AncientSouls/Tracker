import * as _ from 'lodash';

import {
  TClass,
  IInstance,
} from 'ancient-mixins/lib/mixins';

import {
  Manager,
  IManager,
  IManagerEventsList,
} from 'ancient-mixins/lib/manager';

import {
  Tracker,
  TTracker,
} from './tracker';

export type TClient =  IClient<TTracker, IClientEventsList>;

export interface IClientEventsList extends IManagerEventsList {
  start: { client: TClient; };
  started: { client: TClient; };
  stop: { client: TClient; };
  stopped: { client: TClient; };
}

export interface IClient<IN extends TTracker, IEventsList extends IClientEventsList> extends IManager<IN, IEventsList> {
  isStarted: boolean;
  client?: any;

  starting(): Promise<void>;
  stopping(): Promise<void>;

  start(): Promise<void>;
  stop(): Promise<void>;

  tracking(tracker): void;
  untracking(tracker): void;
}

export function mixin<T extends TClass<IInstance>>(
  superClass: T,
): any {
  return class Client extends superClass {
    isStarted = false;
    client;
    
    starting() {}
    stopping() {}

    async start() {
      if (!this.isStarted) {
        this.isStarted = true;
        this.emit('start', { client: this });
        await this.starting();
        this.emit('started', { client: this });
      }
    }

    async stop() {
      if (this.isStarted) {
        this.isStarted = false;
        this.emit('stop', { client: this });
        await this.stopping();
        this.emit('stopped', { client: this });
      }
    }

    tracking(tracker) {}

    async add(tracker) {
      await this.tracking(tracker);
      super.add(tracker);
    }

    untracking(tracker) {}

    async remove(tracker) {
      await this.untracking(tracker);
      super.remove(tracker);
    }
  };
}

export const MixedClient: TClass<TClient> = mixin(Manager);
export class Client extends MixedClient {}
