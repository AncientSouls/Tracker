import { TClass, IInstance } from 'ancient-mixins/lib/mixins';
import { INode, INodeEventsList } from 'ancient-mixins/lib/node';
import { TTracker, ITrackerItem, ITrackerStart } from './tracker';
declare type TTracking = ITracking<ITrackingItem, ITrackingEventsList<ITrackingItem>>;
interface ITrackingItem {
    query: any;
    tracker: TTracker;
    tracking: TTracking;
}
interface ITracking<ITE extends ITrackingItem, IEventsList extends ITrackingEventsList<ITrackingItem>> extends INode<IEventsList> {
    start(): Promise<void>;
    stop(): Promise<void>;
    fetch(item: ITE): Promise<any[]>;
    parse(document: any, index: number, item: ITE): Promise<ITrackerItem>;
    trackings: {
        [id: string]: ITE;
    };
    track(query: any): ITrackerStart;
    override(tracking: ITE): Promise<void>;
}
interface ITrackingEventsList<ITE extends ITrackingItem> extends INodeEventsList {
    tracked: ITE;
    untracked: ITE;
    overrided: ITE;
    started: ITE;
    stopped: ITE;
}
declare function mixin<T extends TClass<IInstance>>(superClass: T): any;
declare const MixedTracking: TClass<TTracking>;
declare class Tracking extends MixedTracking {
}
export { mixin as default, mixin, MixedTracking, Tracking, ITracking, TTracking, ITrackingItem, ITrackingEventsList };
