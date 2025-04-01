
import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProcessLinkService } from './process-link.service';

class ProcessLinkDto {
    url: string;
    question: string;
    index?: string;
    topK?: number;
}

class ProcessResponse {
    success: boolean;
    link: string;
    answer: string;
}

@ApiTags('processLink')
@Controller()
export class ProcessLinkController {
    constructor(private readonly processLinkService: ProcessLinkService) { }

    @Post('get-link')
    @ApiOperation({ summary: '获取链接文本内容', description: '通过 Fetch 获取指定链接的文本内容' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                link: { type: 'string', example: 'https://example.com' },
                captureAs: { type: 'string', enum: ['text', 'html'], example: 'text', default: 'text' },
            },
            required: ['link'],
        },
    })
    @ApiResponse({
        status: 200, description: '链接内容返回成功', schema: {
            type: 'object', properties: {
                url: { type: 'string', example: 'https://example.com' },
                success: { type: 'boolean', example: true },
                content: { type: 'string', example: null }
            }
        }
    })
    async getLink(@Body() body: any) {
        const { link, captureAs = 'text' } = body;
        try {
            const { success, content } = await this.processLinkService.getLinkText(link, captureAs);
            return { url: link, success, content };
        } catch (e) {
            console.error(e);
            return { url: link, success: false, content: null };
        }
    }

    @Post('process-link')
    @ApiOperation({ summary: '存储网页内容并执行 RAG 问答' })
    @ApiBody({
        description: '输入网页链接，并向 AI 提问',
        required: true,
        schema: {
          example: {
            url: 'https://example.com',
            question: '这篇文章的主要内容是什么？',
            index: 'rag',
            topK: 5
          }
        }
      })
    @ApiResponse({
        status: 200,
        description: '返回存储状态及 AI 生成的回答',
        schema: {
          example: {
            success: true,
            link: 'https://example.com',
            answer: '这篇文章的主要内容是...'
          }
        }
      })
    async process(@Body() { url, question, index = 'rag', topK = 5 }: ProcessLinkDto) {
        return await this.processLinkService.processLink(url, question, index, topK);
    }
}
