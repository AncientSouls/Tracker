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
const tracker_1 = require("../lib/tracker");
const sqlite3 = require('sqlite3').verbose();
class SqliteTracker extends tracker_1.Tracker {
    resubscribe(query) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            yield _super("resubscribe").call(this, query);
            const { db, sql } = query;
            const idField = query.idField || 'id';
            const versionField = query.versionField || 'version';
            return new Promise((resolve) => {
                const handler = (error, rows) => {
                    const items = _.map(rows, (row, i) => {
                        return {
                            id: row[idField],
                            version: row[versionField],
                            index: i,
                            data: row,
                        };
                    });
                    this.override(items);
                    return items;
                };
                db.all(sql, (error, rows) => {
                    const items = handler(error, rows);
                    resolve(items);
                });
                const iterate = () => {
                    this.emit('iteratee', { query, tracker: this });
                    db.all(sql, handler);
                };
                this.tracking = setInterval(iterate, 25);
            });
        });
    }
    unsubscribe() {
        return __awaiter(this, void 0, void 0, function* () {
            clearInterval(this.tracking);
        });
    }
}
exports.SqliteTracker = SqliteTracker;
//# sourceMappingURL=sqlite-tracker.js.map