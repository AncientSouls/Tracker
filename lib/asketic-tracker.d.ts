import { TClass, IInstance } from 'ancient-mixins/lib/mixins';
import { INode, INodeEventsList } from 'ancient-mixins/lib/node';
import { ITrackerEventItemData, TTracker } from './tracker';
import { IQuery, IQueryFlow } from 'ancient-asket/lib/asket';
declare type TAsketicTracker = IAsketicTracker<IAsketicTrackerEventsList>;
interface IAsketicTrackerEventItemData extends ITrackerEventItemData {
    path: string;
}
interface IAsketicTrackerEventTrackData extends ITrackerEventItemData {
    tracker: TTracker;
    path: string;
    flow: IQueryFlow;
}
interface IAsketicTrackerEventsList extends INodeEventsList {
    added: IAsketicTrackerEventItemData;
    changed: IAsketicTrackerEventItemData;
    removed: IAsketicTrackerEventItemData;
    tracked: IAsketicTrackerEventTrackData;
    untracked: IAsketicTrackerEventTrackData;
}
interface IAsketicTrackerResolverResult {
    tracker?: TTracker;
    data?: any[];
}
interface IAsketicTrackerResolver {
    (flow: IQueryFlow): Promise<IAsketicTrackerResolverResult>;
}
interface IAsketicTracker<IEventsList extends IAsketicTrackerEventsList> extends INode<IEventsList> {
    trackerClass: TClass<TTracker>;
    resubscribe(query: IQuery, schemaResolver: IAsketicTrackerResolver): Promise<any>;
    unsubscribe(): Promise<void>;
}
declare function mixin<T extends TClass<IInstance>>(superClass: T, trackerClass: T): any;
declare const MixedAsketicTracker: TClass<TAsketicTracker>;
declare class AsketicTracker extends MixedAsketicTracker {
}
export { mixin as default, mixin, MixedAsketicTracker, AsketicTracker, IAsketicTracker, IAsketicTrackerEventsList, TAsketicTracker, IAsketicTrackerEventItemData, IAsketicTrackerEventTrackData, IAsketicTrackerResolver, IAsketicTrackerResolverResult };
