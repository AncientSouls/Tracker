"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const trackerToBundles = (asketicTracker, callback) => {
    asketicTracker.on('added', (eventData) => {
        const { item, result, path } = eventData;
        callback([{
                path, type: 'splice',
                deleteCount: 0, start: item.newIndex,
                values: [_.cloneDeep(_.get(result, 'data'))],
            }], 'added', eventData);
    });
    asketicTracker.on('changed', (eventData) => {
        const { item, result, path } = eventData;
        const bundles = [];
        if (item.oldIndex !== item.newIndex) {
            bundles.push({ path, type: 'move', from: item.oldIndex, to: item.newIndex });
        }
        if (item.changed) {
            bundles.push({ path: [...path, item.newIndex], type: 'set', value: _.cloneDeep(result.data) });
        }
        callback(bundles, 'changed', eventData);
    });
    asketicTracker.on('removed', (eventData) => {
        const { item, result, path } = eventData;
        callback([{
                path, type: 'splice',
                deleteCount: 1, start: item.oldIndex,
                values: [],
            }], 'removed', eventData);
    });
    asketicTracker.on('subscribed', (eventData) => {
        const { result } = eventData;
        callback([{
                path: '', type: 'set',
                value: result.data,
            }], 'subscribed', eventData);
    });
};
exports.trackerToBundles = trackerToBundles;
//# sourceMappingURL=bundles.js.map