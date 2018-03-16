import { Database } from 'sqlite3';
import { Tracker } from '../lib/tracker';
interface ISqliteQquery {
    db: Database;
    sql: string;
    idField?: string;
    versionField?: string;
}
declare class SqliteTracker extends Tracker {
    resubscribe(query: ISqliteQquery): Promise<{}>;
    unsubscribe(): Promise<void>;
}
export { SqliteTracker, ISqliteQquery };
