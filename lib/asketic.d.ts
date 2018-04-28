import { TClass, IInstance } from 'ancient-mixins/lib/mixins';
import { INode, INodeEventsList } from 'ancient-mixins/lib/node';
import { TTracker, ITrackerChanges } from './tracker';
import { TBundlePaths } from 'ancient-cursor/lib/bundle';
import { IQueryFlow } from 'ancient-asket/lib/asket';
export declare type TAsketic = IAsketic<IAsketicEventsList>;
export interface IAsketicChange {
    changes: ITrackerChanges;
    path: TBundlePaths;
}
export declare type IAsketicChanges = IAsketicChange[];
export interface IAsketicEventsList extends INodeEventsList {
    getted: {
        changes: IAsketicChanges;
        asketic: TAsketic;
    };
    setted: {
        asketic: TAsketic;
    }[];
}
export interface IAsketic<IEventsList extends IAsketicEventsList> extends INode<IEventsList> {
    processing: boolean;
    waiting: {
        [id: string]: IQueryFlow;
    }[];
    getDataPath(path: IQueryFlow[]): any[];
    get(): Promise<IAsketicChanges>;
    set(flow: IQueryFlow): any;
    next(flow: IQueryFlow): Promise<IQueryFlow>;
    flowTracker(prevFlow: IQueryFlow, tracker: TTracker): Promise<IQueryFlow>;
    flowItems(prevFlow: IQueryFlow): IQueryFlow;
    flowItem(prevFlow: IQueryFlow): IQueryFlow;
    flowRoot(prevFlow: IQueryFlow): IQueryFlow;
    flowValue(prevFlow: IQueryFlow): IQueryFlow;
}
export declare function mixin<T extends TClass<IInstance>>(superClass: T): any;
export declare const MixedAsketic: TClass<TAsketic>;
export declare class Asketic extends MixedAsketic {
}
