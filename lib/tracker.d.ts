import { TClass, IInstance } from 'ancient-mixins/lib/mixins';
import { INode, INodeEventsList } from 'ancient-mixins/lib/node';
declare type TTracker = ITracker<ITrackerEventsList>;
declare type TIndex = number;
declare type TId = number | string;
declare type TVersion = number | string;
interface IItem {
    id: TId;
    version: TVersion;
    index: TIndex;
    data: any;
}
interface ITrackerEventsList extends INodeEventsList {
}
interface ITracker<IEventsList extends ITrackerEventsList> extends INode<IEventsList> {
}
declare function mixin<T extends TClass<IInstance>>(superClass: T): any;
declare const MixedTracker: TClass<ITracker<ITrackerEventsList>>;
declare class Tracker extends MixedTracker {
}
export { mixin as default, mixin, MixedTracker, Tracker, ITracker, ITrackerEventsList, TTracker, TIndex, TId, TVersion, IItem };
