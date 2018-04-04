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
  Adapter,
  IAdapter,
  IAdapterItem,
  IAdapterEventsList,
  IAdapterClient,
} from './adapter';

export type TIntervalAdapter =  IIntervalAdapter<IIntervalAdapterClient, IAdapterItem, IAdapterEventsList<IAdapterItem>>;

export interface IIntervalAdapter<
  IC,
  ITE extends IAdapterItem,
  IEventsList extends IAdapterEventsList<IAdapterItem>,
>
extends IAdapter<IC, ITE, IEventsList> {
  iteration(): void;
}

export interface IIntervalAdapterClient extends IAdapterClient {
  intervalInstance?: number;
  interval?: number;
}

export function mixin<T extends TClass<IInstance>>(
  superClass: T,
): any {
  return class IntervalAdapter extends superClass {
    async starting() {
      this.client.intervalInstance = setInterval(
        () => this.iteration(),
        this.client.interval || 10,
      );
    }

    iteration() {
      _.each(this.items, tracking => this.override(tracking));
    }

    async stopping() {
      clearInterval(this.client.intervalInstance);
    }
  };
}

export const MixedIntervalAdapter: TClass<TIntervalAdapter> = mixin(Adapter);
export class IntervalAdapter extends MixedIntervalAdapter {}
