import { TClass, IInstance } from 'ancient-mixins/lib/mixins';
import { INode, INodeEventsList } from 'ancient-mixins/lib/node';
export declare type TTracker = ITracker<ITrackerEventsList>;
export interface ITrackerItem {
    id: string;
    data?: any;
    oldIndex?: number;
    newIndex?: number;
    memory?: any;
    changed?: boolean;
    tracker?: TTracker;
}
export interface ITrackerEventData {
    tracker?: TTracker;
}
export interface ITrackerEventsList extends INodeEventsList {
    added: ITrackerItem;
    changed: ITrackerItem;
    removed: ITrackerItem;
    subscribed: ITrackerEventData;
    unsubscribed: ITrackerEventData;
}
export interface ITrackerStop {
    (): Promise<void>;
}
export interface ITrackerStart {
    (tracker: TTracker): Promise<ITrackerStop>;
}
export interface ITracker<IEventsList extends ITrackerEventsList> extends INode<IEventsList> {
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
export declare function mixin<T extends TClass<IInstance>>(superClass: T): any;
export declare const MixedTracker: TClass<TTracker>;
export declare class Tracker extends MixedTracker {
}
