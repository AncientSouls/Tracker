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
const chai_1 = require("chai");
const tracker_1 = require("../lib/tracker");
const client_1 = require("../lib/client");
exports.default = () => {
    describe('Client:', () => {
        it('stop removes all trackers', () => __awaiter(this, void 0, void 0, function* () {
            const client = new client_1.Client();
            yield client.start();
            const trackers = _.times(5, () => new tracker_1.Tracker());
            let t;
            for (t in trackers) {
                yield client.add(trackers[t]);
            }
            chai_1.assert.equal(_.size(client.list.nodes), 5);
            yield client.stop();
            yield client.destroy();
            chai_1.assert.equal(_.size(client.list.nodes), 0);
        }));
    });
};
//# sourceMappingURL=client.js.map