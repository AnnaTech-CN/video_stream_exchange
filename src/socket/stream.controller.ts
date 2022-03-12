import {
  WSController,
  OnWSConnection,
  Inject,
  OnWSDisConnection,
} from '@midwayjs/decorator';
import { Context } from '@midwayjs/ws';
import * as http from 'http';
import * as qs from 'query-string';
import { createWebSocketStream } from 'ws';

import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';
import * as ffmpeg from 'fluent-ffmpeg';

@WSController()
export class HelloSocketController {
  @Inject()
  ctx: Context;

  ffmpegCommand: ffmpeg.FfmpegCommand;

  @OnWSConnection()
  async onConnectionMethod(socket: Context, request: http.IncomingMessage) {
    console.log(`namespace / got a connection ${this.ctx.readyState}`);
    const query = qs.parseUrl(request.url).query;
    if (query.url == null) {
      socket.close();
    }
    const url = query.url;

    // 获取前端请求的流地址（前端websocket连接时后面带上流地址）

    // 传入连接的ws客户端 实例化一个流

    // 通过ffmpeg命令 对实时流进行格式转换 输出flv格式
    ffmpeg.setFfmpegPath(ffmpegPath);
    this.ffmpegCommand = ffmpeg(url as string, {
      logger: {
        debug: debug => {
          console.log('debug: ', debug);
        },
        info: info => {
          console.log('info: ', info);
        },
        warn: warn => {
          console.log('warn: ', warn);
        },
        error: error => {
          console.log('error: ', error);
        },
      },
    })
      .addInputOption('-timeout', '10')
      .on('start', commandLine => {
        console.log('Stream Start With' + commandLine);
      })
      .on('codecData', () => {
        console.log('Stream codecData.');
      })
      .on('error', err => {
        console.log('An error occured: ', err.message);
        socket.close();
      })
      .on('end', () => {
        console.log('end');
        socket.close();
      })
      .on('timeout', () => {
        console.log('timeout');
        socket.close();
      })
      .outputOptions('-movflags frag_keyframe+empty_moov')
      .fpsOutput(25)
      .outputFormat('flv');

    try {
      // 执行命令 传输到实例流中返回给客户端

      this.ffmpegCommand.writeToStream(createWebSocketStream(this.ctx));
    } catch (error) {
      console.log(error);
    }
  }

  @OnWSDisConnection()
  async onClose(data) {
    this.ffmpegCommand.kill('SIGKILL');
  }
}
