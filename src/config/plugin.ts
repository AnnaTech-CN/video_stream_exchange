import { EggPlugin } from 'egg';
export default {
  // static: false,
  httpProxyPlus: {
    enable: true,
    package: 'egg-http-proxy-plus',
  },
} as EggPlugin;
