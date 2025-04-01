import { Injectable } from "@nestjs/common";
import { Document } from 'langchain/document';
import { splitTextDocuments } from "./uttils/text-split";
import { embedTextWithOllama } from "./uttils/ollama";
import { upsertToPinecone } from "./database";

@Injectable()
export class textService{
    async getDocument(documents:Document[],indexName:string){
        const splitdocs=await splitTextDocuments(documents)
        const texts=splitdocs.map((doc)=>doc.pageContent)
        const vectors=await embedTextWithOllama(texts)
        await upsertToPinecone(indexName,texts,vectors)
        return {success:true,count:texts.length}
    }

}