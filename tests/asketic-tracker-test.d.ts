import { ICursor, ICursorEventsList } from 'ancient-cursor/lib/cursor';
export interface ITestResult {
    id: number;
    num: number;
}
export interface IO {
    (): Promise<any>;
}
export declare const query: {
    schema: {
        name: string;
        options: {
            query: number;
        };
        fields: {
            id: {};
            num: {};
            next: {
                name: string;
                options: {
                    query: number;
                };
                fields: {
                    num: {};
                };
            };
        };
    };
};
export declare const starter: (adapter: any) => (asketicTracker: any) => Promise<any>;
export declare const delay: (t: any) => Promise<void>;
declare const _default: (cursor: ICursor<ICursorEventsList>, fill: IO, insert9as3: IO, change3to5: IO, move3to6: IO, move4to3: IO, delete4: IO) => Promise<void>;
export default _default;
