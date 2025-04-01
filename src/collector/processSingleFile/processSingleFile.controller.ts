import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { WATCH_DIRECTORY } from '../utils/constant';
import { processSingleFileService } from './processSingleFile.service';

@ApiTags('process')
@Controller('process')
export class ProcessController {
  constructor(private readonly processService: processSingleFileService) { }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: WATCH_DIRECTORY,
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
          const extension = path.extname(file.originalname);
          const rawFilename = path.basename(file.originalname, extension);
          const decodedFilename = Buffer.from(rawFilename, 'binary').toString('utf8');
          const filename = `${decodedFilename}-${uniqueSuffix}${extension}`;
          cb(null, filename);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: '上传文件并处理',
    description: '上传文件后立即执行内容提取与文档分块，并支持提问。',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        question: {
          type: 'string',
          description: '上传后希望提问的内容',
          example: '这篇文章的主要内容是什么？',
        },
      },
      required: ['file', 'question'],
    },
  })
  @ApiResponse({
    status: 200,
    description: '文件上传、存储成功，并返回 AI 生成的回答',
    schema: {
      example: {
        filename: 'example-1711790878239-abc123.txt',
        success: true,
        answer: '这篇文章主要讨论了...',
      },
    },
  })
  async uploadAndProcess(
    @UploadedFile() file: Express.Multer.File,
    @Body('question') question: string,
  ) {
    const filename = file.filename;
    try {
      const { success, answer } = await this.processService.processSingleFile(filename, question);

      return {
        filename,
        success,
        answer,
      };
    } catch (e) {
      console.error(e);
      return {
        filename,
        success: false,
        answer: '处理过程中发生错误',
      };
    }
  }
}
