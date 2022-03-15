import {
  WSController,
  OnWSConnection,
  Inject,
  OnWSDisConnection,
  OnWSMessage,
} from '@midwayjs/decorator';
import { Context } from '@midwayjs/ws';
import * as http from 'http';
import * as qs from 'query-string';
import { createWebSocketStream } from 'ws';

// import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';
import * as ffmpeg from 'fluent-ffmpeg';
// import path = require('path');

@WSController()
export class HelloSocketController {
  @Inject()
  ctx: Context;

  ffmpegCommand: ffmpeg.FfmpegCommand;

  @OnWSConnection()
  async onConnectionMethod(socket: Context, request: http.IncomingMessage) {
    this.ctx.onerror = event => {
      console.log('ws error: ', event.message);
    };
    console.log(`namespace / got a connection ${this.ctx.readyState}`);
    const query = qs.parseUrl(request.url).query;
    if (query.url == null) {
      socket.close();
    }
    const url = query.url;

    // 获取前端请求的流地址（前端websocket连接时后面带上流地址）

    // 传入连接的ws客户端 实例化一个流

    // 通过ffmpeg命令 对实时流进行格式转换 输出flv格式
    // ffmpeg.setFfmpegPath(ffmpegPath);
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
      // .addInputOption('-timeout', '10')
      .on('start', commandLine => {
        console.log('Stream Start With' + commandLine);
      })
      .on('codecData', () => {
        console.log('Stream codecData.');
      })
      .on('error', err => {
        console.log('An error occured: ', err);
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
      //   .outputOptions('-movflags frag_keyframe+empty_moov')

      .outputFormat('flv')
      .videoCodec('libx264')
      .noAudio();

    try {
      // 执行命令 传输到实例流中返回给客户端
      this.ffmpegCommand.pipe(createWebSocketStream(this.ctx));
    } catch (error) {
      console.log(error);
    }
  }

  @OnWSMessage('message')
  async onMessage(data) {
    console.log('message: ', data);
    return data;
  }

  @OnWSDisConnection()
  async onClose(data) {
    console.log('data: ', data);

    this.ffmpegCommand.kill('SIGKILL');
  }
}
