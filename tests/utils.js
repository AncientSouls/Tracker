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
const sqlite3 = require('sqlite3').verbose();
const tracking_1 = require("../lib/tracking");
const startDb = () => new Promise((resolver) => {
    const db = new sqlite3.Database(':memory:');
    db.serialize(() => {
        resolver(db);
    });
});
exports.startDb = startDb;
const stopDb = (db) => new Promise(resolve => db.close(() => resolve()));
const delay = (t) => new Promise(resolve => setTimeout(resolve, t));
exports.delay = delay;
const exec = (db, sql) => {
    return new Promise((resolve, reject) => db.exec(sql, (error, rows) => {
        if (error)
            reject(error);
        else
            resolve(rows);
    }));
};
exports.exec = exec;
const fetch = (db, sql) => {
    return new Promise((resolve, reject) => db.all(sql, (error, rows) => {
        if (error)
            reject(error);
        else
            resolve(rows);
    }));
};
exports.fetch = fetch;
class TestTracking extends tracking_1.Tracking {
    start(db) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            this.db = db;
            this.interval = setInterval(() => {
                _.each(this.items, (tracking) => {
                    this.override(tracking);
                });
            }, 10);
            yield _super("start").call(this);
        });
    }
    stop() {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            clearInterval(this.interval);
            yield stopDb(this.db);
            yield _super("stop").call(this);
        });
    }
    fetch(item) {
        return fetch(this.db, item.query);
    }
}
exports.TestTracking = TestTracking;
const newAsketicTrackerStart = (tracking, query) => (asketicTracker) => __awaiter(this, void 0, void 0, function* () {
    const resolver = (flow) => __awaiter(this, void 0, void 0, function* () {
        if (flow.env.type === 'items') {
            return asketicTracker.resolveItemData(flow, flow.data.data);
        }
        if (flow.env.name === 'select') {
            const tracker = yield asketicTracker.track(flow);
            const trackerAddedListener = item => items.splice(item.newIndex, 0, item);
            const sql = _.template(_.get(flow, 'schema.options.sql'))(_.get(flow, 'env.item.data'));
            tracker.init(tracking.track(sql));
            const items = [];
            tracker.on('added', trackerAddedListener);
            yield tracker.subscribe();
            tracker.off('added', trackerAddedListener);
            return asketicTracker.resolveItemsArray(flow, items);
        }
        return asketicTracker.resolveDefault(flow);
    });
    return yield asketicTracker.asket({
        query,
        resolver: asketicTracker.createResolver(resolver),
    });
});
exports.newAsketicTrackerStart = newAsketicTrackerStart;
//# sourceMappingURL=utils.js.map