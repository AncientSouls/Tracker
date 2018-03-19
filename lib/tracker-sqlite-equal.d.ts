import { Database } from 'sqlite3';
import { TTracker, ITrackingGetItems, ITrackingStart } from './tracker';
interface IIteratorResult {
    getItems: ITrackingGetItems;
    start: ITrackingStart;
    trackers: TTracker[];
    destroy: () => void;
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
declare const getItems: (db: any, tracker: any) => Promise<any[]>;
declare const createIterator: (db: Database, time?: number) => IIteratorResult;
export { toItem, getItems, createIterator, IIteratorResult };
