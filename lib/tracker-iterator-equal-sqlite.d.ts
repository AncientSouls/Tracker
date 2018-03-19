import { Database } from 'sqlite3';
import { toItem, getItems, IIteratorEqualFetch, IIteratorResult } from './tracker-iterator-equal';
declare const createFetch: (db: Database) => IIteratorEqualFetch;
declare const createIterator: (db: Database, time: any) => IIteratorResult;
export { toItem, getItems, createIterator, createFetch };
