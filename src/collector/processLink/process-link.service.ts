import { Injectable } from '@nestjs/common';
import { vaildURL } from '../utils/url';
import { scrapeGenericUrl } from './convert/scraper.service';
import { textService } from 'src/server/text.service';
import { Document } from 'langchain/document';
import { askWithRag } from '../utils/askWithRag';
import { querySimilar } from 'src/server/database';

@Injectable()
export class ProcessLinkService {
  constructor(private readonly textSerive: textService) { }
  async processLink(link: string, question: string | undefined, index = 'rag', topK = 5) {
    if (!vaildURL(link)) {
      return { success: false, reason: 'Not a valid URL.' };
    }
    const result = await scrapeGenericUrl(link);

    const docs = result.documents.map((doc) => {
      const content = doc.pageCount || '';
      const { pageCount, ...metadata } = doc;

      return new Document({
        pageContent: content,
        metadata
      });
    });

    console.log(`存储链接内容: ${link}`)
    await this.textSerive.getDocument(docs, index)
    let answer = "";
    if (question) {
        const dbResults = await querySimilar(question, 'rag', 5);

        const combinedDocs = [
            ...docs.map((doc) => doc.pageContent),
            ...dbResults.map((res) => res.text), 
        ].filter(Boolean);

        answer = await askWithRag(question, combinedDocs);
    }
    return { success: true, link, answer };
  }

  async getLinkText(link: string, captureAs: 'text' | 'html' = 'text') {
    if (!vaildURL(link)) {
      return { success: false, reason: 'Not a valid URL.' };
    }
    return await scrapeGenericUrl(link, captureAs, false);
  }

}
