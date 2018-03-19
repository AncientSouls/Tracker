import { TClass, IInstance } from 'ancient-mixins/lib/mixins';
import { INode, INodeEventsList } from 'ancient-mixins/lib/node';
declare type TTracker = ITracker<ITrackerEventsList>;
interface ITrackerItem {
    id: string;
    data?: any;
    oldIndex?: number;
    newIndex?: number;
    memory?: any;
    changed?: boolean;
    tracker?: TTracker;
}
interface ITrackerEventData {
    tracker?: TTracker;
}
interface ITrackerEventsList extends INodeEventsList {
    added: ITrackerItem;
    changed: ITrackerItem;
    removed: ITrackerItem;
    subscribed: ITrackerEventData;
    unsubscribed: ITrackerEventData;
}
interface ITrackerStop {
    (): Promise<void>;
}
interface ITrackerStart {
    (tracker: TTracker): Promise<ITrackerStop>;
}
interface ITracker<IEventsList extends ITrackerEventsList> extends INode<IEventsList> {
    ids: string[];
    memory: {
        [id: string]: any;
    };
    isStarted: boolean;
    needUnsubscribe: boolean;
    start?: ITrackerStart;
    stop?: ITrackerStop;
    add(item: ITrackerItem): void;
    change(item: ITrackerItem): void;
    remove(item: ITrackerItem): void;
    override(items: ITrackerItem[]): void;
    clean(): void;
    init(start?: ITrackerStart): this;
    subscribe(): Promise<void>;
    unsubscribe(): Promise<void>;
}
declare function mixin<T extends TClass<IInstance>>(superClass: T): any;
declare const MixedTracker: TClass<TTracker>;
declare class Tracker extends MixedTracker {
}
export { mixin as default, mixin, MixedTracker, Tracker, ITracker, ITrackerEventsList, TTracker, ITrackerItem, ITrackerEventData, ITrackerStart, ITrackerStop };
