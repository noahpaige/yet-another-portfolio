const fs = require("fs");
const path = require("path");

// Path to the MDX file
const mdxFilePath = path.join(
  __dirname,
  "../src/articles/projects/ghost-of-tsushima/content.mdx"
);

// Read the file
let content = fs.readFileSync(mdxFilePath, "utf8");

// Function to transform Cloudinary URL from high-res to low-res
function transformToSmallSrc(srcUrl) {
  // Replace the transformation parameters
  // From: w_3440,h_1440,q_100,f_auto
  // To: w_300,h_125,q_80,f_auto
  return srcUrl.replace(
    /w_3440,h_1440,q_100,f_auto/g,
    "w_300,h_125,q_80,f_auto"
  );
}

// Count how many objects need updating
const objectsWithoutSmallSrc = content.match(
  /src:\s*"https:\/\/res\.cloudinary\.com[^"]+",\s*alt:\s*"[^"]+",\s*width:\s*\d+,\s*height:\s*\d+,?\s*}/g
);
console.log(
  `Found ${
    objectsWithoutSmallSrc ? objectsWithoutSmallSrc.length : 0
  } objects without smallSrc`
);

// Use a more specific regex to find and replace
// This looks for the pattern: src: "url", alt: "text", width: num, height: num
// and adds smallSrc after the src line
let updatedCount = 0;

// Replace each occurrence
content = content.replace(
  /(src:\s*"https:\/\/res\.cloudinary\.com[^"]+",\s*)(alt:\s*"[^"]+",\s*width:\s*\d+,\s*height:\s*\d+,?\s*})/g,
  (match, srcPart, restPart) => {
    // Extract the src URL
    const srcMatch = srcPart.match(/src:\s*"([^"]+)"/);
    if (srcMatch) {
      const srcUrl = srcMatch[1];
      const smallSrc = transformToSmallSrc(srcUrl);
      updatedCount++;
      return `${srcPart}smallSrc: "${smallSrc}",\n      ${restPart}`;
    }
    return match;
  }
);

// Write the updated content back to the file
fs.writeFileSync(mdxFilePath, content, "utf8");

console.log(`✅ Script completed!`);
console.log(`🔄 Updated ${updatedCount} objects with smallSrc`);
console.log(`📁 Updated file: ${mdxFilePath}`);
