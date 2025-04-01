import slugify from "slugify";
import { createdDate, trashFile, writeToServerDocuments } from "src/collector/utils/file";
import { tokenizeString } from "src/collector/utils/tokenizer";
import Tesseract from "tesseract.js";
import { v4 } from "uuid";

async  function ocrWithTesseract(imagePath: string, lang = 'chi_sim') {
    const result = await Tesseract.recognize(imagePath, lang, {
        logger: (m) => console.log(m),
    });

    return result.data.text;
}
export default async function asImage({ fullFilePath = "", filename = "" }) {
    let content = await ocrWithTesseract(fullFilePath)
    if (!content.length) {
        console.error(`Resulting text content was empty for ${filename}.`);
        trashFile(fullFilePath);
        return {
            success: false, reason: `No text content found in ${filename}.`,
            documents: [],
        }
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