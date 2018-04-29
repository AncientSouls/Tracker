import { TClass, IInstance } from 'ancient-mixins/lib/mixins';
import { INode, INodeEventsList } from 'ancient-mixins/lib/node';
export declare type TTracker = ITracker<ITrackerEventsList>;
export interface ITrackerChange {
    id: string;
    item: any;
    oldIndex: number;
    newIndex: number;
    changed?: boolean;
}
export declare type ITrackerChanges = ITrackerChange[];
export interface ITrackerChangeEvent {
    tracker: TTracker;
    change: ITrackerChange;
}
export interface ITrackerEventsList extends INodeEventsList {
    setted: {
        tracker: TTracker;
        current: any[];
        update: any[];
    };
    getted: {
        tracker: TTracker;
        current: any[];
        update: any[];
        changes: ITrackerChanges;
    };
    added: ITrackerChangeEvent;
    changed: ITrackerChangeEvent;
    removed: ITrackerChangeEvent;
}
export interface ITracker<IEventsList extends ITrackerEventsList> extends INode<IEventsList> {
    indexes: {
        [id: string]: number;
    };
    current: any[];
    update?: any[];
    query?: any;
    idField: string;
    set(update: any[]): void;
    isChanged(previous: any, current: any): boolean;
    fetch: () => Promise<any[]> | any[];
    get(handler?: (ITrackerChange) => ITrackerChange): Promise<ITrackerChanges>;
}
export declare function mixin<T extends TClass<IInstance>>(superClass: T): any;
export declare const MixedTracker: TClass<TTracker>;
export declare class Tracker extends MixedTracker {
}
