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
    return class Tracking extends superClass {
        constructor() {
            super(...arguments);
            this.isStarted = false;
            this.items = {};
        }
        start() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.isStarted) {
                    throw new Error(`Started tracking ${this.id} cant be started.`);
                }
                this.isStarted = true;
                this.emit('started', { tracking: this });
            });
        }
        stop() {
            return __awaiter(this, void 0, void 0, function* () {
                if (!this.isStarted) {
                    throw new Error(`Not started tracking ${this.id} cant be stopped.`);
                }
                this.isStarted = false;
                this.emit('stopped', { tracking: this });
            });
        }
        fetch(query) {
            throw new Error('Method fetch must defined in this class!');
        }
        parse(data, newIndex, query, tracker) {
            return __awaiter(this, void 0, void 0, function* () {
                const id = data.id;
                const oldVersion = tracker.memory[data.id];
                const isChanged = !_.isEqual(data, (oldVersion || {}));
                return {
                    id, data, newIndex,
                    tracker,
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
                const item = { query, tracker, tracking: this };
                this.items[tracker.id] = item;
                yield this.override(item);
                this.tracked(item);
                return () => __awaiter(this, void 0, void 0, function* () {
                    delete this.items[tracker.id];
                    this.untracked(item);
                });
            });
        }
        override(item) {
            return __awaiter(this, void 0, void 0, function* () {
                const { query, tracker } = item;
                const records = yield this.fetch(query);
                const data = yield Promise.all(_.map(records, (d, i) => this.parse(d, i, query, tracker)));
                tracker.override(data);
                this.emit('overrided', item);
            });
        }
        destroy() {
            if (this.isStarted) {
                throw new Error(`Started tracking ${this.id} cant be destroyed.`);
            }
            super.destroy();
        }
    };
}
exports.default = mixin;
exports.mixin = mixin;
const MixedTracking = mixin(node_1.Node);
exports.MixedTracking = MixedTracking;
class Tracking extends MixedTracking {
}
exports.Tracking = Tracking;
//# sourceMappingURL=tracking.js.map