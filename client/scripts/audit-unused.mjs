import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const srcRoot = path.join(repoRoot, "src");
const aliasAt = srcRoot; // "@" => "./src" (vite + tsconfig)

const CODE_EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
const ALL_SCAN_EXTS = new Set([
  ...CODE_EXTS,
  ".css",
  ".scss",
  ".sass",
  ".less",
  ".json",
  ".svg",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".md",
]);

function walkDir(dir) {
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const cur = stack.pop();
    let entries = [];
    try {
      entries = fs.readdirSync(cur, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const ent of entries) {
      const full = path.join(cur, ent.name);
      if (ent.isDirectory()) {
        if (ent.name === "node_modules") continue;
        if (ent.name.startsWith(".")) continue;
        stack.push(full);
      } else if (ent.isFile()) {
        out.push(full);
      }
    }
  }
  return out;
}

function relFromRepo(absPath) {
  return path.relative(repoRoot, absPath).replaceAll("\\", "/");
}

function isScanFile(absPath) {
  const ext = path.extname(absPath).toLowerCase();
  return ALL_SCAN_EXTS.has(ext);
}

function isCodeFile(absPath) {
  const ext = path.extname(absPath).toLowerCase();
  return CODE_EXTS.has(ext);
}

function readText(absPath) {
  try {
    return fs.readFileSync(absPath, "utf8");
  } catch {
    return "";
  }
}

// Very simple import finder (good enough for a cleanup audit; not a full parser)
const IMPORT_RE =
  /(?:import\s+(?:type\s+)?[\s\S]*?\s+from\s+|import\s*\(\s*|require\s*\(\s*|export\s+(?:type\s+)?[\s\S]*?\s+from\s+)["']([^"']+)["']/g;

function findSpecifiers(code) {
  const specs = [];
  let m;
  while ((m = IMPORT_RE.exec(code))) specs.push(m[1]);
  return specs;
}

function resolveSpecifier(fromAbs, spec) {
  // Ignore bare package imports
  if (!spec.startsWith(".") && !spec.startsWith("@/")) return null;

  let base;
  if (spec.startsWith("@/")) base = path.join(aliasAt, spec.slice(2));
  else base = path.resolve(path.dirname(fromAbs), spec);

  // If spec already has extension
  if (path.extname(base)) {
    const p = base;
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
    return null;
  }

  // Try common resolutions
  const tries = [
    ...[...CODE_EXTS].map((ext) => base + ext),
    ...[...CODE_EXTS].map((ext) => path.join(base, "index" + ext)),
    // allow CSS/json/etc when imported without extension
    base + ".css",
    base + ".json",
    path.join(base, "index.css"),
    path.join(base, "index.json"),
  ];
  for (const t of tries) {
    if (fs.existsSync(t) && fs.statSync(t).isFile()) return t;
  }
  return null;
}

function normalizeForDup(content) {
  // Strip block + line comments (best-effort), collapse whitespace
  const noBlock = content.replace(/\/\*[\s\S]*?\*\//g, "");
  const noLine = noBlock.replace(/(^|[^:])\/\/.*$/gm, "$1");
  return noLine.replace(/\s+/g, " ").trim();
}

function baseNameKey(relPath) {
  const bn = path.basename(relPath).replace(/\.(tsx?|jsx?|mjs|cjs)$/i, "");
  return bn
    .replace(/(New|Old|Copy|Backup|Temp|Test|Draft|V2|V3)$/i, "")
    .toLowerCase();
}

// --- main ---
if (!fs.existsSync(srcRoot)) {
  console.error("No src/ folder found.");
  process.exit(1);
}

const allFiles = walkDir(srcRoot).filter(isScanFile);
const codeFiles = allFiles.filter(isCodeFile);

const entrypoints = [path.join(srcRoot, "main.tsx"), path.join(srcRoot, "main.ts")].filter((p) =>
  fs.existsSync(p),
);
if (!entrypoints.length) {
  console.error("Could not find src/main.tsx or src/main.ts as entrypoint.");
  process.exit(1);
}

const queue = [...entrypoints];
const reachable = new Set(queue.map((p) => path.normalize(p)));
const edges = new Map(); // from -> [to]

while (queue.length) {
  const cur = queue.shift();
  if (!cur) break;
  const txt = readText(cur);
  if (!txt) continue;
  const specs = findSpecifiers(txt);
  for (const spec of specs) {
    const resolved = resolveSpecifier(cur, spec);
    if (!resolved) continue;
    const norm = path.normalize(resolved);
    if (!edges.has(cur)) edges.set(cur, []);
    edges.get(cur).push(norm);
    if (!reachable.has(norm)) {
      reachable.add(norm);
      queue.push(norm);
    }
  }
}

const reachableRel = [...reachable].map(relFromRepo).sort();
const allCodeRel = codeFiles.map(relFromRepo).sort();
const unused = allCodeRel.filter((p) => !reachableRel.includes(p));

// Duplicate detection (by normalized content hash + name key)
const byContent = new Map(); // normContent -> [relPath]
for (const abs of codeFiles) {
  const rel = relFromRepo(abs);
  const norm = normalizeForDup(readText(abs));
  if (!norm) continue;
  const key = String(norm.length) + ":" + norm.slice(0, 2000); // avoid huge keys
  const arr = byContent.get(key) ?? [];
  arr.push(rel);
  byContent.set(key, arr);
}
const exactDupGroups = [...byContent.values()].filter((g) => g.length > 1).sort((a, b) => b.length - a.length);

const byNameKey = new Map(); // nameKey -> [relPath]
for (const abs of codeFiles) {
  const rel = relFromRepo(abs);
  const k = baseNameKey(rel);
  const arr = byNameKey.get(k) ?? [];
  arr.push(rel);
  byNameKey.set(k, arr);
}
const nameDupGroups = [...byNameKey.entries()]
  .filter(([, g]) => g.length > 1)
  .map(([k, g]) => ({ key: k, files: g.sort() }))
  .sort((a, b) => b.files.length - a.files.length);

const report = {
  summary: {
    entrypoints: entrypoints.map(relFromRepo),
    totalSrcFiles: allFiles.length,
    totalCodeFiles: codeFiles.length,
    reachableCodeFiles: reachableRel.length,
    unusedCodeFiles: unused.length,
    exactDuplicateGroups: exactDupGroups.length,
    nameDuplicateGroups: nameDupGroups.length,
  },
  unusedCodeFiles: unused,
  exactDuplicateGroups: exactDupGroups,
  nameDuplicateGroups: nameDupGroups.slice(0, 50),
};

console.log(JSON.stringify(report, null, 2));

