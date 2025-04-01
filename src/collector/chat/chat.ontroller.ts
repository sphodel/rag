import { Body, Controller, Post } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { ApiBody, ApiOperation, ApiResponse } from "@nestjs/swagger";


@Controller()
export class chatController {
    constructor(private readonly ChatService: ChatService) {}

    @Post('chat')
    @ApiOperation({ summary: '与ai对话', description: '不上传文件直接对话' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                question: {
                    type: 'string',
                    description: '用户提问的内容',
                },
            },
            required: ['question'],
        },
    })
    @ApiResponse({
        status:200,schema:{
            type:'object',properties:{
                success:{type:'string'},
                answer:{type:'string'}
            }
        }
    })
    async getAnswer(@Body() body: { question: string }) {
        const { question } = body; 
        try{
            const {success,answer}=await this.ChatService.dirChat(question)
            return {success,answer}
        }catch(err){
            console.error(err);
            return {success:false,answer:null}
        }
    }
}