import { Database } from 'sqlite3';
import { TTracker, ITrackingStart, IItem } from './tracker';
interface IIteratorResult {
    start: ITrackingStart;
    trackers: TTracker[];
    destroy: () => void;
}
declare const getItems: (db: any, tracker: any) => Promise<IItem[]>;
declare const createIterator: (db: Database, time?: number) => IIteratorResult;
export { getItems, createIterator, IIteratorResult };
