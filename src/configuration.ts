// src/configuration.ts
import { Configuration } from '@midwayjs/decorator';
import * as egg from '@midwayjs/web';

import * as ws from '@midwayjs/ws';
import * as defaultConfig from './config/config.default';

@Configuration({
  imports: [egg, ws],
  importConfigs: [
    {
      default: defaultConfig,
    },
  ],
})
export class ContainerLifeCycle {
  async onReady() {}
}
