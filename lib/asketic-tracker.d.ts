import { TClass, IInstance } from 'ancient-mixins/lib/mixins';
import { INode, INodeEventsList } from 'ancient-mixins/lib/node';
import { ITrackerItem, TTracker } from './tracker';
import { IQueryFlow } from 'ancient-asket/lib/asket';
export declare type TAsketicTracker = IAsketicTracker<IAsketicTrackerEventsList>;
export interface IAsketicTrackerFlowEnv {
    type: 'root' | 'item' | 'value';
    [key: string]: any;
}
export interface IAsketicTrackerFlow extends IQueryFlow {
    env: IAsketicTrackerFlowEnv;
}
export interface IAsketicTrackerItem {
    asketicTracker: TAsketicTracker;
    flow: IQueryFlow;
    result?: any;
    item?: ITrackerItem;
    path?: string[];
}
export interface IAsketicTrackerEventsList extends INodeEventsList {
    added: IAsketicTrackerItem;
    changed: IAsketicTrackerItem;
    removed: IAsketicTrackerItem;
    subscribe: IAsketicTrackerItem;
    subscribed: IAsketicTrackerItem;
    unsubscribe: IAsketicTrackerItem;
    unsubscribed: IAsketicTrackerItem;
}
export interface IAsketicTrackerAsk {
    (tracker: TTracker): Promise<any>;
}
export interface IAsketicTracker<IEventsList extends IAsketicTrackerEventsList> extends INode<IEventsList> {
}
export declare function mixin<T extends TClass<IInstance>>(superClass: T, trackerClass: T): any;
export declare const MixedAsketicTracker: TClass<TAsketicTracker>;
export declare class AsketicTracker extends MixedAsketicTracker {
}
