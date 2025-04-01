import axios from "axios";

export async function askWithRag(question: string, contextDocs: string[]): Promise<string> {
    if (!contextDocs.length) {
        return '未找到相关信息。';
    }

    const context = contextDocs.map((text) => `相关内容: ${text}`).join('\n\n');

    const prompt = `你是一个智能助手，请根据提供的上下文回答用户问题。\n\n${context}\n\n用户问题: ${question}`;

    try {
        const response = await axios.post('http://localhost:11434/api/generate', {
            model: 'deepseek-r1:7b',
            prompt: prompt,
            stream: false
        });
        return response.data.response.trim();
    } catch (error) {
        console.error('Ollama 生成回答失败:', error);
        return '无法生成回答，请稍后再试。';
    }
}
