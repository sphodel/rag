import * as fs from 'fs';
import slugify from 'slugify';
import { createdDate, trashFile, writeToServerDocuments } from 'src/collector/utils/file';
import { tokenizeString } from 'src/collector/utils/tokenizer';
import { v4 } from 'uuid';
export default async function asTxt({ fullFilePath = "", filename = "" }) {
    let content = ""
    try {
        content = fs.readFileSync(fullFilePath, "utf-8")
    } catch (err) {
        console.error("Could not read file!", err);
    }
    if (!content?.length) {
        console.error(`Resulting text content was empty for ${filename}.`);
        trashFile(fullFilePath);
        return {
            success: false,
            reason: `No text content found in ${filename}.`,
            documents: [],
        };
    }
    console.log(`-- Working ${filename} --`);
    const data = {
        id: v4(),
        url: "file://" + fullFilePath,
        title: filename,
        docAuthor: "Unknown", // TODO: Find a better author
        description: "Unknown", // TODO: Find a better description
        docSource: "a text file uploaded by the user.",
        chunkSource: "",
        published: createdDate(fullFilePath),
        wordCount: content.split(" ").length,
        pageContent: content,
        token_count_estimate: tokenizeString(content),
    };
    const document = writeToServerDocuments(
        data,
        `${slugify(filename)}-${data.id}`
    );
    trashFile(fullFilePath);
    console.log(`[SUCCESS]: ${filename} converted & ready for embedding.\n`);
    return { success: true, reason: null, documents: [document] };
}