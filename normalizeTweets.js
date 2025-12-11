const fs = require("fs");
const path = require("path");

// ---------------------------------------------
// CONFIG
// ---------------------------------------------
const parentDir = __dirname;
const folderPattern = /^tweets_(\d+)_/; // tweets_1_antizionism

// ---------------------------------------------
// Extract numeric sort key from a prefix
// e.g. "6" → 6, "6y" → 6, "23a" → 23
// ---------------------------------------------
function extractNumericPart(id) {
  const m = String(id).match(/^(\d+)/);
  return m ? parseInt(m[1], 10) : Infinity;
}

// ---------------------------------------------
// Extract full raw ID from filename prefix
// e.g. "6_y_file.js" -> "6y", "23a_file.js" -> "23a"
// ---------------------------------------------
function extractRawIdFromFilename(filename) {
  const m = filename.match(/^(\d+[a-z]?)/i);
  return m ? m[1] : null;
}

// ---------------------------------------------
// Get all JS files in a folder (not recursive)
// ---------------------------------------------
function getJsFiles(dir) {
  return fs
    .readdirSync(dir)
    .filter(f => f.endsWith(".js"))
    .map(f => path.join(dir, f));
}

// ---------------------------------------------
// Parse folder list and sort numerically
// ---------------------------------------------
const tweetFolders = fs
  .readdirSync(parentDir, { withFileTypes: true })
  .filter(e => e.isDirectory() && folderPattern.test(e.name))
  .map(e => ({
    folderName: e.name,
    folderPath: path.join(parentDir, e.name),
    folderNum: parseInt(e.name.match(folderPattern)[1], 10)
  }))
  .sort((a, b) => a.folderNum - b.folderNum);

if (tweetFolders.length === 0) {
  console.error("❌ No folders found matching tweets_#_*");
  process.exit(1);
}

console.log("Folders to process (in order):");
tweetFolders.forEach(f => console.log("  -", f.folderName));

// ---------------------------------------------
// Global counter for claimIds across folders
// ---------------------------------------------
let nextClaimId = 1;

// Map: oldRawId → newNumericId
const globalIdMap = {};

// For updating example arrays later
const allFiles = [];

// ---------------------------------------------
// PROCESS EACH FOLDER
// ---------------------------------------------
for (const folder of tweetFolders) {
  console.log(`\n📁 Processing folder: ${folder.folderName}`);

  const jsFiles = getJsFiles(folder.folderPath);

  if (jsFiles.length === 0) continue;

  // ---------------------------------------------
  // Sort files:
  // 1. by numeric part of prefix (6,6,6,7...)
  // 2. by remainder of filename, case-insensitive
  // ---------------------------------------------
  const fileInfo = jsFiles
    .map(file => {
      const filename = path.basename(file);
      const rawId = extractRawIdFromFilename(filename);
      const numeric = extractNumericPart(rawId || filename);
      const remainder = filename.replace(/^(\d+[a-z]?)/i, "").toLowerCase();
      return { file, filename, rawId, numeric, remainder };
    })
    .sort((a, b) => {
      if (a.numeric !== b.numeric) return a.numeric - b.numeric;
      return a.remainder.localeCompare(b.remainder, undefined, {
        sensitivity: "accent"
      });
    });

  // ---------------------------------------------
  // Assign new claimIds for this folder
  // ---------------------------------------------
  for (const info of fileInfo) {
    if (!info.rawId) {
      console.warn("⚠️ Could not extract ID from", info.filename);
      continue;
    }
    globalIdMap[info.rawId] = nextClaimId++;
  }

  allFiles.push(...fileInfo);
}

// ---------------------------------------------
// Function to rewrite file contents
// ---------------------------------------------
function rewriteContent(content, oldRawId) {
  const newId = globalIdMap[oldRawId];

  let updated = content;

  // Replace claimId: "6y" → claimId: 7
  updated = updated.replace(
    /claimId:\s*["'`](\d+[a-z]?)[ "'`]/gi,
    (match, id) => `claimId: ${globalIdMap[id]}`
  );

  // Replace example.claimIds: ["1","6y","23a"]
  updated = updated.replace(
    /claimIds:\s*\[([^\]]*)\]/gi,
    (match, inner) => {
      const parts = inner
        .split(",")
        .map(s => s.trim().replace(/['"`]/g, ""))
        .filter(Boolean);

      const replaced = parts.map(id => {
        return globalIdMap[id] || id;
      });

      return `claimIds: [${replaced.join(", ")}]`;
    }
  );

  // Replace variable names:
  // const claim6y → const claim7
  updated = updated.replace(
    new RegExp(`claim${oldRawId}\\b`, "gi"),
    `claim${newId}`
  );

  updated = updated.replace(
    new RegExp(`examples${oldRawId}\\b`, "gi"),
    `examples${newId}`
  );

  return updated;
}

// ---------------------------------------------
// WRITE OUT NEW FILES
// ---------------------------------------------
console.log("\n✏️ Rewriting all files...");

for (const info of allFiles) {
  const oldRawId = info.rawId;
  const newId = globalIdMap[oldRawId];

  const oldPath = info.file;
  const folder = path.dirname(oldPath);

  // New filename: replace old prefix ("6y") with new numeric ("7")
  const newFilename = info.filename.replace(
    /^(\d+[a-z]?)/i,
    String(newId)
  );
  const newPath = path.join(folder, newFilename);

  const content = fs.readFileSync(oldPath, "utf-8");
  const newContent = rewriteContent(content, oldRawId);

  fs.writeFileSync(newPath, newContent, "utf-8");

  if (newPath !== oldPath) fs.unlinkSync(oldPath);

  console.log(`✔ ${info.filename} → ${newFilename}`);
}

console.log("\n🎉 DONE — All claimIds normalized perfectly.\n");
