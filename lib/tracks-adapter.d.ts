import { TClass, IInstance } from 'ancient-mixins/lib/mixins';
import { IAdapter, IAdapterItem, IAdapterEventsList, IAdapterClient } from './adapter';
export declare type TTracksAdapter = ITracksAdapter<ITracksAdapterClient, IAdapterItem, IAdapterEventsList<IAdapterItem>>;
export interface ITracksAdapter<IC, ITE extends IAdapterItem, IEventsList extends IAdapterEventsList<IAdapterItem>> extends IAdapter<IC, ITE, IEventsList> {
}
export interface ITracksAdapterClient extends IAdapterClient {
}
export declare function mixin<T extends TClass<IInstance>>(superClass: T): any;
export declare const MixedTracksAdapter: TClass<TTracksAdapter>;
export declare class TracksAdapter extends MixedTracksAdapter {
}
