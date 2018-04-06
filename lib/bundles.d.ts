import { TAsketicTracker, IAsketicTracker, IAsketicTrackerEventsList } from '../lib/asketic-tracker';
import { IBundle } from 'ancient-cursor/lib/bundle';
interface ITrackerToBundlesCallback<IEventsList> {
    <IE extends keyof IEventsList>(bundles: IBundle[], eventName: IE, eventData: IEventsList[IE]): void;
}
declare const trackerToBundles: (asketicTracker: IAsketicTracker<IAsketicTrackerEventsList>, callback: ITrackerToBundlesCallback<IAsketicTrackerEventsList>) => void;
export { trackerToBundles, TAsketicTracker, ITrackerToBundlesCallback };
