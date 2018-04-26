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
declare const _default: (cursor: ICursor<ICursorEventsList>, fill: IO, insert9as3: IO, change3to5: IO, move3to6: IO, move4to3: IO, delete4: IO) => Promise<void>;
export default _default;
