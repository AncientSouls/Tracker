import { TClass, IInstance } from 'ancient-mixins/lib/mixins';
import { INode, INodeEventsList } from 'ancient-mixins/lib/node';
import { TTracker, ITrackerItem, ITrackerStart } from './tracker';
declare type TTracking = ITracking<ITrackingItem, ITrackingEventsList>;
interface ITrackingItem {
    query: any;
    tracker: TTracker;
    tracking: TTracking;
}
interface ITracking<ITE extends ITrackingItem, IEventsList extends ITrackingEventsList> extends INode<IEventsList> {
    start(): Promise<void>;
    stop(): Promise<void>;
    fetch(query: any): Promise<any[]>;
    parse(document: any, index: number, query: any, tracker: TTracker): Promise<ITrackerItem>;
    trackings: {
        [id: string]: ITE;
    };
    track(query: any): ITrackerStart;
    override(tracking: ITE): Promise<void>;
}
interface ITrackingEventsList extends INodeEventsList {
    tracked: ITrackingItem;
    untracked: ITrackingItem;
    overrided: ITrackingItem;
    started: ITrackingItem;
    stopped: ITrackingItem;
}
declare function mixin<T extends TClass<IInstance>>(superClass: T): any;
declare const MixedTracking: TClass<TTracking>;
declare class Tracking extends MixedTracking {
}
export { mixin as default, mixin, MixedTracking, Tracking, ITracking, TTracking, ITrackingItem, ITrackingEventsList };
