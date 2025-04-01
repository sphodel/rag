import { SUPPORTED_FILETYPE_CONVERTERS, WATCH_DIRECTORY } from "../utils/constant";
import * as path from "path"
import * as fs from "fs"
import { isTextType, isWithin, normalizePath, trashFile } from "../utils/file";
import { Injectable } from "@nestjs/common";
import { Document } from 'langchain/document';
import { textService } from "src/server/text.service";
import { askWithRag } from "../utils/askWithRag";
import { querySimilar } from "src/server/database";
@Injectable()
export class processSingleFileService {
    constructor(private readonly textSerive: textService) { }
    async processSingleFile(targetFilename: string, question: string) {
        const fullFilePath = path.resolve(
            WATCH_DIRECTORY,
            normalizePath(targetFilename)
        );
        if (!isWithin(path.resolve(WATCH_DIRECTORY), fullFilePath)) {
            return {
                success: false,
                reason: "Filename is a not a valid path to process.",
                documents: [],
            };
        }
        if (!fs.existsSync(fullFilePath)) {
            return {
                success: false,
                reason: "File does not exist in upload directory.",
                document: []
            }
        }
        const fileExtension = path.extname(fullFilePath).toLowerCase()
        if (fullFilePath.includes(".") && !fileExtension) {
            return {
                success: false,
                reason: 'No file extension found. This file cannot be processed.',
                document: []
            }
        }
        let processFileAs = fileExtension;
        if (!SUPPORTED_FILETYPE_CONVERTERS.hasOwnProperty(fileExtension)) {
            if (isTextType(fullFilePath)) {
                console.log(
                    `\x1b[33m[Collector]\x1b[0m The provided filetype of ${fileExtension} does not have a preset and will be processed as .txt.`
                );
                processFileAs = ".txt";
            } else {
                trashFile(fullFilePath);
                return {
                    success: false,
                    reason: `File extension ${fileExtension} not supported for parsing and cannot be assumed as text file type.`,
                    documents: [],
                };
            }
        }
        const module = await import(SUPPORTED_FILETYPE_CONVERTERS[processFileAs]);
        const FileTypeProcessor = module.default;

        const result = await FileTypeProcessor({
            fullFilePath,
            filename: targetFilename,
        });
        const docs = result.documents.map((doc) => {
            const content = doc.pageContent || '';
            const { pageContent, ...metadata } = doc;

            return new Document({
                pageContent: content,
                metadata
            });
        });
        console.log(`存储新文档: ${targetFilename}`)
        await this.textSerive.getDocument(docs, 'rag')
        let answer = "";
        if (question) {
            const dbResults = await querySimilar(question, 'rag', 5);

            const combinedDocs = [
                ...docs.map((doc) => doc.pageContent),
                ...dbResults.map((res) => res.text), 
            ].filter(Boolean);

            answer = await askWithRag(question, combinedDocs);
        }
        return { success: true, targetFilename, answer };
    }
}
