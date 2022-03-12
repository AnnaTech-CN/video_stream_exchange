import { EggPlugin } from 'egg';
export default {
  // static: false,
  httpProxyPlus: {
    enable: true,
    package: 'egg-http-proxy-plus',
  },
  cors: {
    enable: true,
    package: 'egg-cors',
  },
} as EggPlugin;
