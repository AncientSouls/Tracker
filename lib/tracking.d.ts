import { TClass, IInstance } from 'ancient-mixins/lib/mixins';
import { INode, INodeEventsList } from 'ancient-mixins/lib/node';
import { TTracker, ITrackerItem, ITrackerStart } from './tracker';
declare type TTracking = ITracking<ITrackingItem, ITrackingEventsList>;
interface ITrackingItem {
    query: any;
    tracker: TTracker;
    tracking: TTracking;
}
interface ITracking<ITrackingItem, IEventsList extends ITrackingEventsList> extends INode<IEventsList> {
    start(): Promise<void>;
    stop(): Promise<void>;
    fetch(query: any): Promise<any[]>;
    parse(document: any, index: number, query: any, tracker: TTracker): Promise<ITrackerItem>;
    trackings: {
        [id: string]: ITrackingItem;
    };
    track(query: any): ITrackerStart;
    override(tracking: ITrackingItem): Promise<void>;
}
interface ITrackingEventTrackingData {
    tracking: TTracking;
    [key: string]: any;
}
interface ITrackingEventTrackerData extends ITrackingEventTrackingData {
    tracker?: TTracker;
    query?: any;
    data?: any;
}
interface ITrackingEventsList extends INodeEventsList {
    tracked: ITrackingEventTrackerData;
    untracked: ITrackingEventTrackerData;
    overrided: ITrackingEventTrackerData;
    started: ITrackingEventTrackingData;
    stopped: ITrackingEventTrackingData;
}
declare function mixin<T extends TClass<IInstance>>(superClass: T): any;
declare const MixedTracking: TClass<TTracking>;
declare class Tracking extends MixedTracking {
}
export { mixin as default, mixin, MixedTracking, Tracking, ITracking, TTracking, ITrackingItem, ITrackingEventsList, ITrackingEventTrackerData, ITrackingEventTrackingData };
