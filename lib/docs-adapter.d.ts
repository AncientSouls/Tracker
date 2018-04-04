import { TClass, IInstance } from 'ancient-mixins/lib/mixins';
import { IAdapter, IAdapterItem, IAdapterEventsList, IAdapterClient } from './adapter';
export declare type TDocsAdapter = IDocsAdapter<IDocsAdapterClient, IAdapterItem, IAdapterEventsList<IAdapterItem>>;
export interface IDocsAdapter<IC, ITE extends IAdapterItem, IEventsList extends IAdapterEventsList<IAdapterItem>> extends IAdapter<IC, ITE, IEventsList> {
    add(data: any, newIndex: number, item: ITE): Promise<any>;
    change(data: any, newIndex: number, item: ITE): Promise<any>;
    remove(id: any, item: ITE): Promise<any>;
}
export interface IDocsAdapterClient extends IAdapterClient {
}
export declare function mixin<T extends TClass<IInstance>>(superClass: T): any;
export declare const MixedDocsAdapter: TClass<TDocsAdapter>;
export declare class DocsAdapter extends MixedDocsAdapter {
}
