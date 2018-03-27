import { TClass, IInstance } from 'ancient-mixins/lib/mixins';
import { INode, INodeEventsList } from 'ancient-mixins/lib/node';
import { TTracker, ITrackerItem, ITrackerStart } from './tracker';
declare type TTracking = ITracking<INodeEventsList>;
interface ITrackingItem {
    query: any;
    tracker: TTracker;
}
interface ITracking<IEventsList extends INodeEventsList> extends INode<IEventsList> {
    start(): Promise<void>;
    stop(): Promise<void>;
    fetch(query: any): Promise<any[]>;
    parse(document: any, index: number, query: any, tracker: TTracker): Promise<ITrackerItem>;
    trackings: ITrackingItem[];
    track(query: any): ITrackerStart;
    override(tracking: ITrackingItem): Promise<void>;
}
declare function mixin<T extends TClass<IInstance>>(superClass: T): any;
declare const MixedTracking: TClass<TTracking>;
declare class Tracking extends MixedTracking {
}
export { mixin as default, mixin, MixedTracking, Tracking, ITracking, TTracking, ITrackingItem };
