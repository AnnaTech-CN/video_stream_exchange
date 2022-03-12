import { MidwayConfig, MidwayAppInfo } from '@midwayjs/core';
// import { IncomingMessage } from 'http';

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
          router: function (req) {
            const [, ...params] = req.url?.slice(1).split('/');
            const [proxyUrl] = params;
            const realUrl = decodeURIComponent(proxyUrl);
            delete req.headers.origin;
            delete req.headers.referer;

            req.url = req.headers.realpath;

            return `http://${realUrl}`;
          },
          changeOrigin: true,
        },
      },
    ],
    security: {
      domainWhiteList: ['*'],
    },
    cors: {
      exposeHeaders: ['www-authenticate'],
      allowHeaders: ['*'],
    },
  } as MidwayConfig & {
    cors: any;
  };
};
