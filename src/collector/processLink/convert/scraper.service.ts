import { v4 as uuidv4 } from 'uuid';
import { writeToServerDocuments } from '../../utils/file/index';
import slugify from 'slugify';
import { tokenizeString } from '../../utils/tokenizer/index';
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";

export async function scrapeGenericUrl(
  link: string,
  captureAs: "text" | "html" = "text",
  processAsDocument = true
): Promise<any> {
  console.log(`-- Working URL ${link} => (${captureAs}) --`);
  const content = await getPageContent(link, captureAs);

  if (!content || !content.length) {
    console.error(`Resulting URL content was empty at ${link}.`);
    return {
      success: false,
      reason: `No URL content found at ${link}.`,
      documents: [],
    };
  }

  if (!processAsDocument) {
    return {
      success: true,
      content,
    };
  }

  const url = new URL(link);
  const decodedPathname = decodeURIComponent(url.pathname);
  const filename = `${url.hostname}${decodedPathname.replace(/\//g, '_')}`;
  const id = uuidv4();

  const data = {
    id,
    url: 'file://' + slugify(filename) + '.html',
    title: slugify(filename) + '.html',
    docAuthor: 'no author found',
    description: 'No description found',
    docSource: 'URL link uploaded by the user.',
    chunkSource: `link://${link}`,
    published: new Date().toLocaleString(),
    wordCount: content.split(' ').length,
    pageCount: content,
    token_count_estimate: tokenizeString(content),
  };

  const document = writeToServerDocuments(data, `url-${slugify(filename)}-${id}`);
  console.log(`[SUCCESS]: URL ${link} converted & ready for embedding.\n`);

  return {
    success: true,
    reason: null,
    documents: [document],
  };
}

export async function getPageContent(
  link: string,
  captureAs: 'text' | 'html' = 'text'
): Promise<string | null> {
  try {
    const loader = new PuppeteerWebBaseLoader(link, {
      launchOptions: { headless: 'new', ignoreHTTPSErrors: true },
      gotoOptions: { waitUntil: 'networkidle2' },
      async evaluate(page, browser) {
        const result = await page.evaluate((captureAs: string) => {
          if (captureAs === 'html') return document.documentElement.innerHTML;
          return document.body.innerText;
        }, captureAs);
        await browser.close();
        return result;
      },
    });

    const docs = await loader.load();
    return docs.map((doc) => doc.pageContent).join(' ');
  } catch (err) {
    console.warn('Puppeteer failed, falling back to fetch...', err);
  }

  try {
    const res = await fetch(link, {
      method: 'GET',
      headers: {
        'Content-Type': 'text/plain',
        'User-Agent': 'Mozilla/5.0',
      },
    });
    return await res.text();
  } catch (err) {
    console.error('Fetch also failed.', err);
  }

  return null;
}
