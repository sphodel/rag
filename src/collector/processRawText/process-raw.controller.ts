import { Body, Controller, Post } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiTags, ApiResponse } from "@nestjs/swagger";
import { ProcessRawTextService } from "./process-raw.service";

@ApiTags('processRawText')
@Controller()
export class ProcessRawTextController {
  constructor(private readonly processRawTextService: ProcessRawTextService) {}

  @Post('process-raw-text')
  @ApiOperation({ summary: '处理原始文本', description: '提取文本内容并生成嵌入文档数据' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        textContent: { type: 'string', example: 'Sample text content here.' },
        metadata: {
          type: 'object',
          properties: {
            title: { type: 'string', example: 'Document Title' },
            url: { type: 'string', example: 'https://example.com' },
            docAuthor: { type: 'string', example: 'Author Name' },
            description: { type: 'string', example: 'A brief description of the document.' },
            docSource: { type: 'string', example: 'http://source.com' },
            chunkSource: { type: 'string', example: 'Chunk source info' },
            published: { type: 'string', example: '2025-03-28T00:00:00Z' },
          },
        },
      },
      required: ['textContent', 'metadata'],
    },
  })
  @ApiResponse({ status: 200, description: '文本处理成功并返回文档对象' })
  @ApiResponse({ status: 400, description: '处理失败，返回错误信息' })
  async processRawText(@Body() body: any) {
    const { textContent, metadata } = body;

    try {
      const { success, reason, documents } = await this.processRawTextService.processRawText(textContent, metadata);

      return {
        filename: metadata?.title || 'Unknown-doc.txt',
        success,
        reason,
        documents,
      };
    } catch (e) {
      console.error(e);
      return {
        filename: metadata?.title || 'Unknown-doc.txt',
        success: false,
        reason: 'A processing error occurred.',
        documents: [],
      };
    }
  }
}