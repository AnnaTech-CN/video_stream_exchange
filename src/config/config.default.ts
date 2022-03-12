import { MidwayConfig, MidwayAppInfo } from '@midwayjs/core';
import { IncomingMessage } from 'http';

export default (appInfo: MidwayAppInfo) => {
  return {
    // use for cookie sign key, should change to your own and keep security
    // keys: appInfo.name + '_1646835702649_3572',
    egg: {
      port: 7001,
    },
    // security: {
    //   csrf: false,
    // },
    webSocket: {
      port: 9999,
    },
    httpProxyPlus: [
      {
        origin: '/lapi',
        options: {
          router: function (req: IncomingMessage) {
            const [, ...params] = req.url?.slice(1).split('/');
            const [proxyUrl] = params;
            const realUrl = decodeURIComponent(proxyUrl);
            return `http://${realUrl}`;
          },
        },
      },
    ],
  } as MidwayConfig;
};
