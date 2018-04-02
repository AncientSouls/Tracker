import { Database } from 'sqlite3';
import { IAsketicTrackerAsk } from '../lib/asketic-tracker';
import { IQuery } from 'ancient-asket/lib/asket';
import { Tracking } from '../lib/tracking';
declare const startDb: () => Promise<Database>;
declare const delay: (t: any) => Promise<void>;
declare const exec: (db: any, sql: any) => Promise<void>;
declare const fetch: (db: any, sql: any) => Promise<any[]>;
declare class TestTracking extends Tracking {
    db: Database;
    interval: any;
    start(db?: Database): Promise<void>;
    stop(): Promise<void>;
    fetch(query: any): Promise<any[]>;
}
declare const newAsketicTrackerStart: (tracking: TestTracking, query: IQuery) => IAsketicTrackerAsk;
export { TestTracking, delay, exec, fetch, startDb, newAsketicTrackerStart };
