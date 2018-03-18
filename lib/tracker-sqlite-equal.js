"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const getItems = (db, tracker) => {
    return new Promise((resolve) => {
        tracker.query = tracker.query || {};
        let { idField } = tracker.query;
        idField = idField || 'id';
        db.all(tracker.query.sql, (error, rows) => {
            const items = _.map(rows, (row, i) => {
                const id = row[idField];
                const oldVersion = tracker.versions[row[idField]];
                const ch = !_.isEqual(row, (oldVersion || {}).memory);
                return {
                    id,
                    version: {
                        memory: row,
                        changed: ch,
                    },
                    index: i,
                    data: row,
                };
            });
            resolve(items);
            tracker.override(items);
        });
    });
};
exports.getItems = getItems;
const createIterator = (db, time = 25) => {
    const trackers = [];
    const interval = setInterval(() => _.each(trackers, tracker => getItems(db, tracker)), time);
    const destroy = () => clearInterval(interval);
    const start = (newTracker) => __awaiter(this, void 0, void 0, function* () {
        const stop = () => {
            _.remove(trackers, tracker => tracker.id === newTracker.id);
        };
        stop();
        trackers.push(newTracker);
        const items = yield getItems(db, newTracker);
        return { items, stop };
    });
    return { trackers, destroy, start };
};
exports.createIterator = createIterator;
//# sourceMappingURL=tracker-sqlite-equal.js.map