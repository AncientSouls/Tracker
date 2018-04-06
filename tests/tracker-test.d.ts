import { IAdapter, IAdapterEventsList, IAdapterItem, IAdapterClient } from '../lib/adapter';
import { ITracker, ITrackerEventsList } from '../lib/tracker';
export interface ITestResult {
    id: number;
    num: number;
}
export interface IO {
    (): Promise<any>;
}
export declare const delay: (t: any) => Promise<void>;
declare const _default: (adapter: IAdapter<IAdapterClient, IAdapterItem, IAdapterEventsList<IAdapterItem>>, tracker: ITracker<ITrackerEventsList>, asc: any, desc: any, fill: IO, insert9as3: IO, change3to5: IO, move3to6: IO, move4to3: IO, delete4: IO) => Promise<void>;
export default _default;
