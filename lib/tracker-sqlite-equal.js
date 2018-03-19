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
const toItem = (data, index, idField, tracker) => {
    const id = data[idField];
    const oldVersion = tracker.versions[data[idField]];
    const ch = !_.isEqual(data, (oldVersion || {}).memory);
    return {
        id,
        data,
        index,
        version: {
            memory: data,
            changed: ch,
        },
    };
};
exports.toItem = toItem;
const getItems = (db, tracker) => {
    return new Promise((resolve) => {
        tracker.query = tracker.query || {};
        let { idField } = tracker.query;
        idField = idField || 'id';
        db.all(tracker.query.sql, (error, rows) => {
            const items = _.map(rows, (row, i) => toItem(row, i, idField, tracker));
            resolve(items);
        });
    });
};
exports.getItems = getItems;
const createIterator = (db, time = 25) => {
    const trackers = [];
    const interval = setInterval(() => _.each(trackers, (tracker) => __awaiter(this, void 0, void 0, function* () {
        tracker.override(yield getItems(db, tracker));
    })), time);
    const destroy = () => clearInterval(interval);
    const start = (newTracker) => __awaiter(this, void 0, void 0, function* () {
        const stop = () => {
            _.remove(trackers, tracker => tracker.id === newTracker.id);
        };
        stop();
        trackers.push(newTracker);
        return stop;
    });
    const get = tracker => getItems(db, tracker);
    return { trackers, destroy, start, getItems: get };
};
exports.createIterator = createIterator;
//# sourceMappingURL=tracker-sqlite-equal.js.map