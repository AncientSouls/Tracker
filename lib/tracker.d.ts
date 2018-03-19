import { TClass, IInstance } from 'ancient-mixins/lib/mixins';
import { INode, INodeEventsList } from 'ancient-mixins/lib/node';
declare type TTracker = ITracker<ITrackerEventsList>;
declare type TIndex = number;
declare type TId = number | string;
interface IVersion {
    changed: boolean;
    memory?: any;
}
interface IItem {
    id: TId;
    version?: IVersion;
    index?: TIndex;
    data?: any;
}
interface ITrackerEventData {
    tracker: TTracker;
}
interface ITrackerEventTrackerData extends ITrackerEventData {
    items?: IItem[];
}
interface ITrackerEventItemData extends ITrackerEventData {
    id: TId;
    data?: any;
    changed?: boolean;
    oldIndex?: TIndex;
    newIndex?: TIndex;
}
interface ITrackerEventsList extends INodeEventsList {
    added: ITrackerEventItemData;
    changed: ITrackerEventItemData;
    removed: ITrackerEventItemData;
    subscribed: ITrackerEventTrackerData;
    unsubscribed: ITrackerEventData;
}
interface ITrackingGetItems {
    (tracker: TTracker): Promise<IItem[]>;
}
interface ITrackingStop {
    (): void;
}
interface ITrackingStart {
    (tracker: TTracker): Promise<ITrackingStop>;
}
interface ITracker<IEventsList extends ITrackerEventsList> extends INode<IEventsList> {
    ids: TId[];
    versions: {
        [id: string]: IVersion;
    };
    query: any;
    start: ITrackingStart;
    getItems: ITrackingGetItems;
    stop: ITrackingStop;
    tracking: any;
    add(item: IItem): void;
    change(item: IItem): void;
    remove(item: IItem): void;
    override(items: IItem[]): void;
    clean(): void;
    resubscribe(query?: any, getItems?: ITrackingGetItems, start?: ITrackingStart): Promise<IItem[]>;
    unsubscribe(): Promise<void>;
}
declare function mixin<T extends TClass<IInstance>>(superClass: T): any;
declare const MixedTracker: TClass<TTracker>;
declare class Tracker extends MixedTracker {
}
export { mixin as default, mixin, MixedTracker, Tracker, ITracker, ITrackerEventsList, TTracker, TIndex, TId, IVersion, IItem, ITrackerEventData, ITrackerEventTrackerData, ITrackerEventItemData, ITrackingGetItems, ITrackingStart, ITrackingStop };
