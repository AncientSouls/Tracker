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
    return class Adapter extends superClass {
        constructor() {
            super(...arguments);
            this.isStarted = false;
            this.items = {};
        }
        start(client) {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.isStarted) {
                    throw new Error(`Started adapter ${this.id} cant be started.`);
                }
                this.client = client;
                yield this.starting();
                this.isStarted = true;
                this.emit('started', { adapter: this });
            });
        }
        starting() { }
        stop() {
            return __awaiter(this, void 0, void 0, function* () {
                if (!this.isStarted) {
                    throw new Error(`Not started adapter ${this.id} cant be stopped.`);
                }
                yield this.stopping();
                this.isStarted = false;
                this.emit('stopped', { adapter: this });
            });
        }
        stopping() { }
        fetch(item) {
            return __awaiter(this, void 0, void 0, function* () {
                throw new Error('Method fetch must defined in this class!');
            });
        }
        getId(data) {
            return data.id;
        }
        isChanged(id, data, item) {
            const oldVersion = item.tracker.memory[id];
            return !_.isEqual(data, (oldVersion || {}));
        }
        parse(data, newIndex, item) {
            return __awaiter(this, void 0, void 0, function* () {
                const id = this.getId(data);
                const isChanged = this.isChanged(id, data, item);
                return {
                    id, data, newIndex,
                    tracker: item.tracker,
                    memory: data,
                    changed: isChanged,
                };
            });
        }
        tracked(item) {
            this.emit('tracked', item);
        }
        untracked(item) {
            this.emit('untracked', item);
        }
        track(query) {
            return (tracker) => __awaiter(this, void 0, void 0, function* () {
                const item = { query, tracker, adapter: this };
                this.items[tracker.id] = item;
                yield this.tracked(item);
                yield this.override(item);
                return () => __awaiter(this, void 0, void 0, function* () {
                    delete this.items[tracker.id];
                    yield this.untracked(item);
                });
            });
        }
        override(item) {
            return __awaiter(this, void 0, void 0, function* () {
                const { query, tracker } = item;
                const records = yield this.fetch(item);
                const data = yield Promise.all(_.map(records, (d, i) => this.parse(d, i, item)));
                tracker.override(data);
                this.emit('overrided', item);
            });
        }
        destroy() {
            if (this.isStarted) {
                throw new Error(`Started adapter ${this.id} cant be destroyed.`);
            }
            super.destroy();
        }
    };
}
exports.mixin = mixin;
exports.MixedAdapter = mixin(node_1.Node);
class Adapter extends exports.MixedAdapter {
}
exports.Adapter = Adapter;
//# sourceMappingURL=adapter.js.map