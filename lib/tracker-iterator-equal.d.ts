import { TTracker, ITrackingGetItems, ITrackingStart } from './tracker';
interface IIteratorResult {
    getItems: ITrackingGetItems;
    start: ITrackingStart;
    trackers: TTracker[];
    destroy: () => void;
}
interface IIteratorEqualFetch {
    (tracker: TTracker): Promise<any[]>;
}
declare const toItem: (data: any, index: any, idField: any, tracker: any) => {
    id: any;
    data: any;
    index: any;
    version: {
        memory: any;
        changed: boolean;
    };
};
declare const getItems: (fetch: any, tracker: any) => Promise<any[]>;
declare const createIterator: (fetch: IIteratorEqualFetch, time?: number) => IIteratorResult;
export { toItem, getItems, createIterator, IIteratorResult, IIteratorEqualFetch };
