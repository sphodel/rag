import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import slugify from "slugify";
import { createdDate, trashFile, writeToServerDocuments } from "src/collector/utils/file";
import { tokenizeString } from "src/collector/utils/tokenizer";
import { v4 } from "uuid";

export default async function asPdf({ fullFilePath = "", filename = "" }) {
    const loader = new PDFLoader(fullFilePath);
    console.log(`-- Working ${filename} --`);
    let pageContent: string[] = [];
    const docs = await loader.load();
    console.log(docs)
    for (const doc of docs) {
        console.log(`-- Parsing content from PDF page --`);
        if (!doc.pageContent.length) {
            continue;
        }
        pageContent.push(doc.pageContent);
    }
    
    const content = pageContent.join("\n");
    const data = {
        id: v4(),
        url: "file://" + fullFilePath,
        title: filename,
        docAuthor: "no author found",
        description: "No description found.",
        docSource: "PDF file uploaded by the user.",
        chunkSource: "",
        published: createdDate(fullFilePath),
        wordCount: content.split(" ").length,
        pageContent: content,
        token_count_estimate: tokenizeString(content),
    };
    
    const document = writeToServerDocuments(data, `${slugify(filename)}-${data.id}`);
    trashFile(fullFilePath);
    console.log(`[SUCCESS]: ${filename} converted & ready for embedding.\n`);
    return { success: true, reason: null, documents: [document] };
}
