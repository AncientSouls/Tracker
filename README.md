# Ancient Tracker

Any database hierarchical queries and subscriptions.

[![NPM](https://img.shields.io/npm/v/ancient-tracker.svg)](https://www.npmjs.com/package/ancient-tracker)
[![Build Status](https://travis-ci.org/AncientSouls/Tracker.svg?branch=master)](https://travis-ci.org/AncientSouls/Tracker)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/59e712651c484fb2a179961c3ee9fc23)](https://www.codacy.com/app/ivansglazunov/Tracker?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=AncientSouls/Tracker&amp;utm_campaign=Badge_Grade)
[![Read the Docs](https://img.shields.io/readthedocs/pip.svg)](https://ancientsouls.github.io/)

#### Why need to know an `id` in the `tracker`?
To understand who appeared, changed and disappeared from the `previous` results in `current` results.

#### Who decides how to get `id` from the `item`?
By default tracker contains `idField` property with `_id`.

#### What does the `tracker` need to know about the query to any storage?
- function `starting` for know how to start tracking
- function `stopping` for know how to stop tracking
- optional strin key `idField` for override tracker `idField`
