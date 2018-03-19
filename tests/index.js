"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('source-map-support').install();
const tracker_1 = require("./tracker");
const tracker_iterator_equal_sqlite_1 = require("./tracker-iterator-equal-sqlite");
const asketic_tracker_1 = require("./asketic-tracker");
describe('AncientSouls/Tracker:', () => {
    tracker_1.default();
    tracker_iterator_equal_sqlite_1.default();
    asketic_tracker_1.default();
});
//# sourceMappingURL=index.js.map