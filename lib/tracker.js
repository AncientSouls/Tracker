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
const node_1 = require("ancient-mixins/lib/node");
function mixin(superClass) {
    return class Tracker extends superClass {
        constructor() {
            super(...arguments);
            this.indexes = {};
            this.current = [];
            this.idField = '_id';
            this.fetch = () => {
                return this.update;
            };
        }
        set(update) {
            this.update = update;
            this.emit('setted', {
                tracker: this,
                current: this.current,
                update: this.update,
            });
        }
        isChanged(previous, current) {
            return !_.isEqual(previous, current);
        }
        get(handler) {
            return __awaiter(this, void 0, void 0, function* () {
                const update = yield this.fetch();
                if (_.isArray(update)) {
                    const removed = [];
                    const updated = [];
                    const indexes = {};
                    let i;
                    let changed;
                    for (i = 0; i < update.length; i++) {
                        indexes[update[i][this.idField]] = i;
                        if (_.has(this.indexes, update[i][this.idField])) {
                            changed = this.isChanged(this.current[this.indexes[update[i][this.idField]]], update[i]);
                            if (changed) {
                                let change = {
                                    changed,
                                    id: '' + update[i][this.idField],
                                    item: update[i],
                                    oldIndex: this.indexes[update[i][this.idField]],
                                    newIndex: i,
                                };
                                if (handler)
                                    change = yield handler(change);
                                this.emit('changed', { change, tracker: this });
                                updated.push(change);
                            }
                        }
                        else {
                            let change = {
                                id: '' + update[i][this.idField],
                                item: update[i],
                                oldIndex: -1,
                                newIndex: i,
                            };
                            if (handler)
                                change = yield handler(change);
                            this.emit('added', { change, tracker: this });
                            updated.push(change);
                        }
                    }
                    let id;
                    for (id in this.indexes) {
                        if (!_.has(indexes, id)) {
                            let change = {
                                id: '' + id,
                                item: this.current[this.indexes[id]],
                                oldIndex: this.indexes[id],
                                newIndex: -1,
                            };
                            if (handler)
                                change = yield handler(change);
                            this.emit('removed', { change, tracker: this });
                            removed.push(change);
                        }
                    }
                    this.indexes = indexes;
                    this.current = update;
                    this.updated = undefined;
                    const changes = [
                        ...removed,
                        ...updated,
                    ];
                    this.emit('getted', {
                        changes,
                        tracker: this,
                        current: this.current,
                        update: this.update,
                    });
                    return changes;
                }
                this.emit('getted', {
                    changes: [],
                    tracker: this,
                    current: this.current,
                    update: this.update,
                });
                return [];
            });
        }
    };
}
exports.mixin = mixin;
exports.MixedTracker = mixin(node_1.Node);
class Tracker extends exports.MixedTracker {
}
exports.Tracker = Tracker;
//# sourceMappingURL=tracker.js.map