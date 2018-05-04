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
const manager_1 = require("ancient-mixins/lib/manager");
function mixin(superClass) {
    return class Client extends superClass {
        constructor() {
            super(...arguments);
            this.isStarted = false;
        }
        starting() { }
        stopping() { }
        start() {
            return __awaiter(this, void 0, void 0, function* () {
                if (!this.isStarted) {
                    this.isStarted = true;
                    this.emit('start', { client: this });
                    yield this.starting();
                    this.emit('started', { client: this });
                }
            });
        }
        stop() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.isStarted) {
                    this.isStarted = false;
                    this.emit('stop', { client: this });
                    yield this.stopping();
                    this.emit('stopped', { client: this });
                    const trackers = _.clone(this.list.nodes);
                    let t;
                    for (t in trackers) {
                        yield this.remove(trackers[t]);
                    }
                }
            });
        }
        tracking(tracker) { }
        add(tracker) {
            const _super = name => super[name];
            return __awaiter(this, void 0, void 0, function* () {
                yield this.tracking(tracker);
                _super("add").call(this, tracker);
            });
        }
        untracking(tracker) { }
        remove(tracker) {
            const _super = name => super[name];
            return __awaiter(this, void 0, void 0, function* () {
                yield this.untracking(tracker);
                _super("remove").call(this, tracker);
            });
        }
    };
}
exports.mixin = mixin;
exports.MixedClient = mixin(manager_1.Manager);
class Client extends exports.MixedClient {
}
exports.Client = Client;
//# sourceMappingURL=client.js.map