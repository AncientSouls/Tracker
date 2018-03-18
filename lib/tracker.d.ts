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
interface ITrackerEventItemData {
    id: TId;
    changed?: boolean;
    data?: any;
    oldIndex?: TIndex;
    newIndex?: TIndex;
    tracker: TTracker;
}
interface ITrackerEventsList extends INodeEventsList {
    added: ITrackerEventItemData;
    changed: ITrackerEventItemData;
    removed: ITrackerEventItemData;
}
interface ITrackingResults {
    stop: ITrackingStop;
    items: IItem[];
}
interface ITrackingStop {
    (): void;
}
interface ITrackingStart {
    (tracker: TTracker): Promise<ITrackingResults>;
}
interface ITracker<IEventsList extends ITrackerEventsList> extends INode<IEventsList> {
    ids: TId[];
    versions: {
        [id: string]: IVersion;
    };
    query: any;
    start: ITrackingStart;
    stop: ITrackingStop;
    tracking: any;
    add(item: IItem): void;
    change(item: IItem): void;
    remove(item: IItem): void;
    override(items: IItem[]): void;
    clean(): void;
    resubscribe(query: any, start: ITrackingStart): Promise<IItem[]>;
    unsubscribe(): Promise<void>;
}
declare function mixin<T extends TClass<IInstance>>(superClass: T): any;
declare const MixedTracker: TClass<TTracker>;
declare class Tracker extends MixedTracker {
}
export { mixin as default, mixin, MixedTracker, Tracker, ITracker, ITrackerEventsList, TTracker, TIndex, TId, IVersion, IItem, ITrackerEventItemData, ITrackingStart, ITrackingStop, ITrackingResults };
