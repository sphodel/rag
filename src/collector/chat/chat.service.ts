import { Injectable } from "@nestjs/common";
import axios from "axios";

@Injectable()
export class ChatService {
    async dirChat(question: string) {
        if (!question) {
            return { success: false, answer: "输入不能为空" };
        }

        try {
            const response = await axios.post("http://localhost:11434/api/generate", {
                model: "deepseek-r1:7b",
                prompt: question,
                stream:false
            });
            return { success: true, answer: response.data.response }; 
        } catch (error) {
            console.error("请求 AI 失败:", error);
            return { success: false, answer: "AI 处理失败" };
        }
    }
}
