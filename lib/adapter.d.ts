import { TClass, IInstance } from 'ancient-mixins/lib/mixins';
import { INode, INodeEventsList } from 'ancient-mixins/lib/node';
import { TTracker, ITrackerItem, ITrackerStart } from './tracker';
export declare type TAdapter = IAdapter<IAdapterClient, IAdapterItem, IAdapterEventsList<IAdapterItem>>;
export interface IAdapterItem {
    query: any;
    tracker: TTracker;
    adapter?: TAdapter;
    memory?: any;
}
export interface IAdapter<IC, ITE extends IAdapterItem, IEventsList extends IAdapterEventsList<IAdapterItem>> extends INode<IEventsList> {
    client: IC;
    start(client: IC): Promise<any>;
    starting(): Promise<any>;
    stop(): Promise<any>;
    stoping(): Promise<any>;
    fetch(item: ITE): Promise<any[]>;
    getId(data: any): string;
    isChanged(id: any, data: any, item: ITE): boolean;
    parse(document: any, newIndex: number, item: ITE): Promise<ITrackerItem>;
    tracked(item: any): Promise<any>;
    untracked(item: any): Promise<any>;
    items: {
        [id: string]: ITE;
    };
    track(query: any): ITrackerStart;
    override(item: ITE): Promise<any>;
}
export interface IAdapterEventsList<ITE extends IAdapterItem> extends INodeEventsList {
    tracked: ITE;
    untracked: ITE;
    overrided: ITE;
    started: ITE;
    stopped: ITE;
}
export interface IAdapterClient {
    [key: string]: any;
}
export declare function mixin<T extends TClass<IInstance>>(superClass: T): any;
export declare const MixedAdapter: TClass<TAdapter>;
export declare class Adapter extends MixedAdapter {
}
