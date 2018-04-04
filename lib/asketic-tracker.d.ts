import { TClass, IInstance } from 'ancient-mixins/lib/mixins';
import { INode, INodeEventsList } from 'ancient-mixins/lib/node';
import { ITrackerItem, ITrackerStart, TTracker } from './tracker';
import { IQueryResolver, IQueryFlow } from 'ancient-asket/lib/asket';
export declare type TAsketicTracker = IAsketicTracker<IAsketicTrackerEventsList>;
export interface IAsketicTrackerItem {
    asketicTracker: TAsketicTracker;
    item: ITrackerItem;
    result: any;
    path: string;
    flow: IQueryFlow;
}
export interface IAsketicTrackerTracking {
    asketicTracker: TAsketicTracker;
    tracker: TTracker;
    path: string;
    flow: IQueryFlow;
}
export interface IAsketicTrackerSubscribing {
    asketicTracker: TAsketicTracker;
    results?: any;
}
export interface IAsketicTrackerEventsList extends INodeEventsList {
    added: IAsketicTrackerItem;
    changed: IAsketicTrackerItem;
    removed: IAsketicTrackerItem;
    track: IAsketicTrackerTracking;
    tracked: IAsketicTrackerTracking;
    untrack: IAsketicTrackerTracking;
    untracked: IAsketicTrackerTracking;
    subscribed: IAsketicTrackerSubscribing;
    unsubscribed: IAsketicTrackerSubscribing;
}
export interface IAsketicTrackerAsk {
    (tracker: TTracker): Promise<any>;
}
export interface IAsketicTracker<IEventsList extends IAsketicTrackerEventsList> extends INode<IEventsList> {
    trackerClass: TClass<TTracker>;
    isStarted: boolean;
    ask: IAsketicTrackerAsk;
    trackers: TTracker[];
    init(start?: ITrackerStart): this;
    resolveItemData(flow: IQueryFlow, data: any): IQueryFlow;
    resolveItemsArray(flow: IQueryFlow, items: ITrackerItem[]): IQueryFlow;
    resolveDefault(flow: IQueryFlow): IQueryFlow;
    watchTracker(tracker: TTracker, flow: IQueryFlow): void;
    track(flow?: IQueryFlow): TTracker;
    untrack(tracker: TTracker, flow?: IQueryFlow): Promise<void>;
    createResolver(resolver: IQueryResolver): IQueryResolver;
    asket(flow: any): Promise<IQueryFlow>;
    subscribe(): Promise<any>;
    unsubscribe(): Promise<void>;
}
export declare function mixin<T extends TClass<IInstance>>(superClass: T, trackerClass: T): any;
export declare const MixedAsketicTracker: TClass<TAsketicTracker>;
export declare class AsketicTracker extends MixedAsketicTracker {
}
export declare const wrapTracker: (tracker: any, adapter: any, query: any) => Promise<any[]>;
