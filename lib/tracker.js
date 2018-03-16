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
            this.ids = [];
            this.versions = {};
            this.query = null;
        }
        add(item) {
            const { id, version, index, data } = item;
            this.versions[id] = version;
            this.ids.splice(index, 0, id);
            const oldIndex = -1;
            const newIndex = index;
            this.emit('added', {
                id, version, data,
                oldIndex, newIndex,
                tracker: this,
            });
        }
        change(item) {
            const { id, version, index, data } = item;
            const oldIndex = this.ids.indexOf(id);
            const newIndex = index;
            if (oldIndex !== newIndex) {
                this.ids.splice(oldIndex, 1);
                this.ids.splice(newIndex, 0, id);
            }
            this.versions[id] = version;
            this.emit('changed', {
                id, version, data,
                oldIndex, newIndex,
                tracker: this,
            });
        }
        remove(item) {
            const { id, version, index, data } = item;
            const oldIndex = this.ids.indexOf(id);
            const newIndex = -1;
            this.ids.splice(oldIndex, 1);
            delete this.versions[id];
            this.emit('removed', {
                id,
                oldIndex, newIndex,
                tracker: this,
            });
        }
        override(items) {
            const ids = _.map(items, (i) => i.id);
            const oldIds = _.difference(this.ids, ids);
            _.each(oldIds, (id) => {
                this.remove({ id });
            });
            _.each(items, (item) => {
                if (_.has(this.versions, item.id)) {
                    if (item.version !== this.versions[item.id] ||
                        item.index !== this.ids.indexOf(item.id)) {
                        this.change(item);
                    }
                }
                else {
                    this.add(item);
                }
            });
        }
        clean() {
            _.each(_.cloneDeep(this.ids), (id) => {
                this.remove({ id });
            });
        }
        resubscribe(query) {
            return __awaiter(this, void 0, void 0, function* () {
                this.query = query;
                yield this.unsubscribe();
            });
        }
        unsubscribe() {
            return __awaiter(this, void 0, void 0, function* () { });
        }
    };
}
exports.default = mixin;
exports.mixin = mixin;
const MixedTracker = mixin(node_1.Node);
exports.MixedTracker = MixedTracker;
class Tracker extends MixedTracker {
}
exports.Tracker = Tracker;
//# sourceMappingURL=tracker.js.map