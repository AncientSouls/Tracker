"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const tracker_iterator_equal_1 = require("./tracker-iterator-equal");
exports.toItem = tracker_iterator_equal_1.toItem;
exports.getItems = tracker_iterator_equal_1.getItems;
const createFetch = (db) => (tracker) => new Promise(resolve => db.all(_.get(tracker, 'query.sql'), (error, rows) => resolve(rows)));
exports.createFetch = createFetch;
const createIterator = (db, time) => {
    return tracker_iterator_equal_1.createIterator(createFetch(db), time);
};
exports.createIterator = createIterator;
//# sourceMappingURL=tracker-iterator-equal-sqlite.js.map