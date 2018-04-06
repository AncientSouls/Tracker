import { TClass, IInstance } from 'ancient-mixins/lib/mixins';
import { IAdapter, IAdapterItem, IAdapterEventsList, IAdapterClient } from './adapter';
export declare type TIntervalAdapter = IIntervalAdapter<IIntervalAdapterClient, IAdapterItem, IAdapterEventsList<IAdapterItem>>;
export interface IIntervalAdapter<IC, ITE extends IAdapterItem, IEventsList extends IAdapterEventsList<IAdapterItem>> extends IAdapter<IC, ITE, IEventsList> {
    iteration(): void;
}
export interface IIntervalAdapterClient extends IAdapterClient {
    intervalInstance?: number;
    interval?: number;
}
export declare function mixin<T extends TClass<IInstance>>(superClass: T): any;
export declare const MixedIntervalAdapter: TClass<TIntervalAdapter>;
export declare class IntervalAdapter extends MixedIntervalAdapter {
}
