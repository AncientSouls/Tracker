import * as _ from 'lodash';
import { assert } from 'chai';

import {
  Tracker,
} from '../lib/tracker';

import {
  Client,
} from '../lib/client';

export default () => {
  describe('Client:', () => {
    it('stop removes all trackers', async () => {
      const client = new Client();
      await client.start();
      
      const trackers = _.times(5, () => new Tracker());
      let t;
      for (t in trackers) {
        await client.add(trackers[t]);
      }
      
      assert.equal(_.size(client.list.nodes), 5);
      
      await client.stop();
      await client.destroy();
      
      assert.equal(_.size(client.list.nodes), 0);
    });
  });
};
