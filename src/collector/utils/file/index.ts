import * as path from 'path';
import * as fs from 'fs';
import {MimeDetector} from "./mime1"

export const writeToServerDocuments = (
  data: Record<string, any>,
  filename: string,
  destinationOverride: string | null = null,
) => {
  const destination = destinationOverride
    ? path.resolve(destinationOverride)
    : path.resolve(
        __dirname,
        '../../../server/storage/documents/custom-documents',
      );
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive:true });
  }
  const destinationFilePath=path.resolve(destination,filename)+'.json'
  fs.writeFileSync(destinationFilePath,JSON.stringify(data,null,4),{encoding:'utf-8'})
  return {...data,location:destinationFilePath.split('/').slice(-2).join("/")}
};

export function createdDate(filepath:string) {
  try {
    const { birthtimeMs, birthtime } = fs.statSync(filepath);
    if (birthtimeMs === 0) throw new Error("Invalid stat for file!");
    return birthtime.toLocaleString();
  } catch {
    return "unknown";
  }
}

export function trashFile(filepath:string) {
  if (!fs.existsSync(filepath)) return;

  try {
    const isDir = fs.lstatSync(filepath).isDirectory();
    if (isDir) return;
  } catch {
    return;
  }

  fs.rmSync(filepath);
  return;
}

export function normalizePath(filepath = "") {
  const result = path
    .normalize(filepath.trim())
    .replace(/^(\.\.(\/|\\|$))+/, "")
    .trim();
  if (["..", ".", "/"].includes(result)) throw new Error("Invalid path.");
  return result;
}

export function isWithin(outer, inner) {
  if (outer === inner) return false;
  const rel = path.relative(outer, inner);
  return !rel.startsWith("../") && rel !== "..";
}

export function isKnownTextMime(filepath: string) {
  try {
    const mimeLib = new MimeDetector();
    const mime = mimeLib.getType(filepath);
    
    if (!mime) {
      return { valid: false, reason: "unknown_mime" };
    }

    if (mimeLib.badMimes.includes(mime)) {
      return { valid: false, reason: "bad_mime" };
    }

    const type = mime.split("/")[0];
    if (mimeLib.nonTextTypes.includes(type)) {
      return { valid: false, reason: "non_text_mime" };
    }
    
    return { valid: true, reason: "valid_mime" };
  } catch (e) {
    return { valid: false, reason: "generic" };
  }
}

export function parseableAsText(filepath) {
  try {
    const fd = fs.openSync(filepath, "r");
    const buffer = Buffer.alloc(1024); // Read first 1KB of the file synchronously
    const bytesRead = fs.readSync(fd, buffer, 0, 1024, 0);
    fs.closeSync(fd);

    const content = buffer.subarray(0, bytesRead).toString("utf8");
    const nullCount = (content.match(/\0/g) || []).length;
    const controlCount = (content.match(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g) || [])
      .length;

    const threshold = bytesRead * 0.1;
    return nullCount + controlCount < threshold;
  } catch {
    return false;
  }
}

export function isTextType(filepath) {
  if (!fs.existsSync(filepath)) return false;
  const result = isKnownTextMime(filepath);
  if (result.valid) return true; // Known text type - return true.
  if (result.reason !== "generic") return false; // If any other reason than generic - return false.
  return parseableAsText(filepath); // Fallback to parsing as text via buffer inspection.
}