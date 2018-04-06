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

export type TTracksAdapter =  ITracksAdapter<ITracksAdapterClient, IAdapterItem, IAdapterEventsList<IAdapterItem>>;

export interface ITracksAdapter<
  IC,
  ITE extends IAdapterItem,
  IEventsList extends IAdapterEventsList<IAdapterItem>,
>
extends IAdapter<IC, ITE, IEventsList> {
  
}

export interface ITracksAdapterClient extends IAdapterClient {
}

export function mixin<T extends TClass<IInstance>>(
  superClass: T,
): any {
  return class TracksAdapter extends superClass {
    async fetch(item) {
      return item.memory;
    }
  };
}

export const MixedTracksAdapter: TClass<TTracksAdapter> = mixin(Adapter);
export class TracksAdapter extends MixedTracksAdapter {}
