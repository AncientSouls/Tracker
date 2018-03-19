"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('source-map-support').install();
const tracker_1 = require("./tracker");
const tracker_sqlite_equal_1 = require("./tracker-sqlite-equal");
const asketic_tracker_1 = require("./asketic-tracker");
describe('AncientSouls/Tracker:', () => {
    tracker_1.default();
    tracker_sqlite_equal_1.default();
    asketic_tracker_1.default();
});
//# sourceMappingURL=index.js.map