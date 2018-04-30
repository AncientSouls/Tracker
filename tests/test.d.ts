import { ICursor, ICursorEventsList } from 'ancient-cursor/lib/cursor';
export interface IO {
    (): Promise<any>;
}
export interface IData {
    a: {
        b: string;
        c: number;
        d: {
            b: string;
        }[];
    }[];
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
            equal: {
                name: string;
                options: {
                    query: number;
                };
                fields: {
                    id: {};
                };
            };
        };
    };
};
export declare const test: (cursor: ICursor<ICursorEventsList>, fill: IO, insert9as3: IO, change3to5: IO, move3to6: IO, move4to3: IO, delete4: IO) => Promise<void>;
