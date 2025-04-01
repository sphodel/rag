import * as path from "path"

export const WATCH_DIRECTORY =path.resolve(__dirname, "../hotdir")

export const SUPPORTED_FILETYPE_CONVERTERS = {
    ".txt": "./convert/asTxt.js",
    ".md": "./convert/asTxt.js",
    ".org": "./convert/asTxt.js",
    ".adoc": "./convert/asTxt.js",
    ".rst": "./convert/asTxt.js",
  
    ".html": "./convert/asTxt.js",
  
    ".docx": "./convert/asDocx.js",
    ".doc": "./convert/asDocx.js",
  
    ".png": "./convert/asImage.js",
    ".jpg": "./convert/asImage.js",
    ".jpeg": "./convert/asImage.js",
    
    ".pdf": "./convert/asPdf.js"
  };