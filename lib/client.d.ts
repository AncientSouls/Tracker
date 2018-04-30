import { TClass, IInstance } from 'ancient-mixins/lib/mixins';
import { IManager, IManagerEventsList } from 'ancient-mixins/lib/manager';
import { TTracker } from './tracker';
export declare type TClient = IClient<TTracker, IClientEventsList>;
export interface IClientEventsList extends IManagerEventsList {
    start: {
        client: TClient;
    };
    started: {
        client: TClient;
    };
    stop: {
        client: TClient;
    };
    stopped: {
        client: TClient;
    };
}
export interface IClient<IN extends TTracker, IEventsList extends IClientEventsList> extends IManager<IN, IEventsList> {
    isStarted: boolean;
    client?: any;
    starting(): Promise<void>;
    stopping(): Promise<void>;
    start(): Promise<void>;
    stop(): Promise<void>;
    tracking(tracker: any): void;
    untracking(tracker: any): void;
}
export declare function mixin<T extends TClass<IInstance>>(superClass: T): any;
export declare const MixedClient: TClass<TClient>;
export declare class Client extends MixedClient {
}
