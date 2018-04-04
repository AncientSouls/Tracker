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

export type TDocsAdapter =  IDocsAdapter<IDocsAdapterClient, IAdapterItem, IAdapterEventsList<IAdapterItem>>;

export interface IDocsAdapter<
  IC,
  ITE extends IAdapterItem,
  IEventsList extends IAdapterEventsList<IAdapterItem>,
>
extends IAdapter<IC, ITE, IEventsList> {
  add(data: any, newIndex: number, item: ITE): Promise<any>;
  change(data: any, newIndex: number, item: ITE): Promise<any>;
  remove(id: any, item: ITE): Promise<any>;
}

export interface IDocsAdapterClient extends IAdapterClient {}

export function mixin<T extends TClass<IInstance>>(
  superClass: T,
): any {
  return class DocsAdapter extends superClass {
    async add(data, newIndex, item) {
      await item.tracker.add(await this.parse(data, newIndex, item));
    }
    async change(data, newIndex, item) {
      await item.tracker.change(await this.parse(data, newIndex, item));
    }
    async remove(id, item) {
      await item.tracker.remove({
        id, newIndex: -1, tracker: item.tracker,
      });
    }
  };
}

export const MixedDocsAdapter: TClass<TDocsAdapter> = mixin(Adapter);
export class DocsAdapter extends MixedDocsAdapter {}
