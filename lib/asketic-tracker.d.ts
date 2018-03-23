import { TClass, IInstance } from 'ancient-mixins/lib/mixins';
import { INode, INodeEventsList } from 'ancient-mixins/lib/node';
import { ITrackerItem, ITrackerStart, TTracker } from './tracker';
import { IQueryResolver, IQueryFlow } from 'ancient-asket/lib/asket';
declare type TAsketicTracker = IAsketicTracker<IAsketicTrackerEventsList>;
interface IAsketicTrackerItem {
    asketicTracker: TAsketicTracker;
    item: ITrackerItem;
    result: any;
    path: string;
    flow: IQueryFlow;
}
interface IAsketicTrackerTracking {
    asketicTracker: TAsketicTracker;
    tracker: TTracker;
    path: string;
    flow: IQueryFlow;
}
interface IAsketicTrackerSubscribing {
    asketicTracker: TAsketicTracker;
    results?: any;
}
interface IAsketicTrackerEventsList extends INodeEventsList {
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
interface IAsketicTrackerAsk {
    (tracker: TTracker): Promise<any>;
}
interface IAsketicTracker<IEventsList extends IAsketicTrackerEventsList> extends INode<IEventsList> {
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
declare function mixin<T extends TClass<IInstance>>(superClass: T, trackerClass: T): any;
declare const MixedAsketicTracker: TClass<TAsketicTracker>;
declare class AsketicTracker extends MixedAsketicTracker {
}
export { mixin as default, mixin, MixedAsketicTracker, AsketicTracker, IAsketicTracker, IAsketicTrackerEventsList, TAsketicTracker, IAsketicTrackerItem, IAsketicTrackerTracking, IAsketicTrackerSubscribing, IAsketicTrackerAsk };
