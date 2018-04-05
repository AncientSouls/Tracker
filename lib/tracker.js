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
            this.memory = {};
            this.isStarted = false;
            this.needUnsubscribe = false;
            this.start = null;
            this.stop = null;
        }
        init(start) {
            if (this.isStarted) {
                throw new Error(`Started tracker ${this.id} cant be inited.`);
            }
            this.start = start;
            return this;
        }
        subscribe() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.isStarted) {
                    throw new Error(`Started tracker ${this.id} cant be subscribed.`);
                }
                this.stop = yield this.start(this);
                this.isStarted = true;
                this.emit('subscribed', { tracker: this });
                if (this.needUnsubscribe)
                    yield this.unsubscribe();
            });
        }
        unsubscribe() {
            return __awaiter(this, void 0, void 0, function* () {
                if (!this.isStarted) {
                    this.needUnsubscribe = true;
                }
                else {
                    this.isStarted = false;
                    yield this.stop();
                    this.emit('unsubscribed', { tracker: this });
                }
            });
        }
        add(item) {
            this.memory[item.id] = item.memory;
            this.ids.splice(item.newIndex, 0, item.id);
            item.oldIndex = -1;
            item.tracker = this;
            this.emit('added', item);
        }
        change(item) {
            item.oldIndex = this.ids.indexOf(item.id);
            if (item.oldIndex !== item.newIndex) {
                this.ids.splice(item.oldIndex, 1);
                this.ids.splice(item.newIndex, 0, item.id);
            }
            this.memory[item.id] = item.memory;
            item.tracker = this;
            this.emit('changed', item);
        }
        remove(item) {
            item.oldIndex = this.ids.indexOf(item.id);
            item.newIndex = -1;
            this.ids.splice(item.oldIndex, 1);
            delete this.memory[item.id];
            item.tracker = this;
            this.emit('removed', item);
        }
        override(items) {
            const ids = _.map(items, (i) => i.id);
            const oldIds = _.difference(this.ids, ids);
            _.each(oldIds, (id) => {
                this.remove({ id });
            });
            _.each(items, (item) => {
                if (_.has(this.memory, item.id)) {
                    if (item.changed ||
                        item.newIndex !== this.ids.indexOf(item.id)) {
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
    };
}
exports.mixin = mixin;
exports.MixedTracker = mixin(node_1.Node);
class Tracker extends exports.MixedTracker {
}
exports.Tracker = Tracker;
//# sourceMappingURL=tracker.js.map