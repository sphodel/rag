import  slugify  from "slugify";
import { tokenizeString } from "../utils/tokenizer";
import { v4 } from "uuid";
import { writeToServerDocuments } from "../utils/file";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ProcessRawTextService {
    async stripAndSlug(input: string): Promise<string> {
        if (!input.includes('.')) {
            return slugify(input, { lower: true });
        }
        return slugify(input.split('.').slice(0, -1).join("-"), { lower: true });
    }

    METADATA_KEYS = {
        possible: {
            url: ({ url, title }) => {
                let validUrl;
                try {
                    const url1 = new URL(url);
                    validUrl = ["https:", "http:"].includes(url1.protocol);
                } catch {
                    validUrl = false;
                }
                if (validUrl) {
                    return `web://${url.toLowerCase()}.website`;
                }
                return `file://${this.stripAndSlug(title)}.txt`; 
            },
            title: ({ title }) => `${this.stripAndSlug(title)}.txt`, 
            docAuthor: ({ docAuthor }) => typeof docAuthor === 'string' ? docAuthor : 'no author specified',
            description: ({ description }) => typeof description === 'string' ? description : 'no description found',
            docSource: ({ docSource }) => typeof docSource === 'string' ? docSource : 'no source set',
            chunkSource: ({ chunkSource, title }) => typeof chunkSource === 'string' ? chunkSource : `${this.stripAndSlug(title)}.txt`,
            published: ({ published }) => {
                if (isNaN(Number(published))) return new Date().toLocaleString();
                return new Date(Number(published)).toLocaleString();
            },
        },
    };

    async processRawText(textContent: string, metadata: any) {
        console.log(`-- Working Raw Text doc ${metadata.title} --`);
        if (!textContent || textContent.length === 0) {
            return {
                success: false,
                reason: "textContent was empty - nothing to process.",
                documents: [],
            };
        }

        const data = {
            id: v4(),
            url: this.METADATA_KEYS.possible.url(metadata),
            title: this.METADATA_KEYS.possible.title(metadata), 
            docAuthor: this.METADATA_KEYS.possible.docAuthor(metadata),
            description: this.METADATA_KEYS.possible.description(metadata), 
            docSource: this.METADATA_KEYS.possible.docSource(metadata),
            chunkSource: this.METADATA_KEYS.possible.chunkSource(metadata), 
            published: this.METADATA_KEYS.possible.published(metadata),
            wordCount: textContent.split(" ").length,
            pageContent: textContent,
            token_count_estimate: tokenizeString(textContent),
        };

        const document = writeToServerDocuments(data, `raw-${this.stripAndSlug(metadata.title)}-${data.id}`);
        console.log(`[SUCCESS]: Raw text and metadata saved & ready for embedding.\n`);
        console.log(document)
        return { success: true, reason: null, documents: [document] };
    }
}
