const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");
const Tesseract = require("tesseract.js");
const fs = require("fs");
const db = require("../config/db");

const upload = multer({ dest: "uploads/" });

router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const imagePath = req.file.path;
    const sharp = require("sharp");
    const metadata = await sharp(imagePath).metadata();

await sharp(imagePath)
  .extract({ 
    left: 0,
    top: 0,
    width: Math.floor(metadata.width / 2),
    height: metadata.height
  })
  .grayscale()
  .normalize()
  .sharpen()
  .toFile(imagePath + "_processed.jpg");
const processedPath = imagePath + "_processed.jpg";

    const result = await Tesseract.recognize(
  imagePath,
  "eng",
  {
    tessedit_pageseg_mode: 6,
    tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:-/ "
  }
);

    const text = result.data.text;
    console.log("RAW TEXT:\n", text);

    const extracted = extractReceipt(text);

  console.log("EXTRACTED TOTAL:", extracted.totalAmount);
console.log("TYPE:", typeof extracted.totalAmount);



    if (!extracted.totalAmount || isNaN(extracted.totalAmount)) {
  console.log("Total missing — setting to 0");
  extracted.totalAmount = 0;
}

    db.run(
      `INSERT INTO expenses
       (amount, category, currency, date, createdAt, merchant, notes, items, source, userId)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        extracted.totalAmount,
        extracted.category,
        "INR",
        extracted.date,
        new Date().toISOString(),
        extracted.merchantName,
        "Scanned Receipt",
        JSON.stringify(extracted.items),
        "scan",
        req.user.id
      ],
      function (err) {
        if (err) {
          return res.status(500).json(err);
        }

        res.json({
          message: "Scanned & Saved Successfully",
          data: extracted
        });
      }
    );

    fs.unlinkSync(imagePath);
    fs.unlinkSync(processedPath);

  } catch (error) {
    console.log("OCR ERROR:", error);
    res.status(500).json({ message: "OCR Failed" });
  }
});

/* ================= SMART RECEIPT PARSER ================= */

function extractReceipt(text) {

  const lines = text
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  const cleanText = text.replace(/,/g, "");

  /* ================= MERCHANT ================= */
/* ================= SMART MERCHANT DETECTION ================= */

 let merchantName = "Scanned Store";

// Take first 6 lines and filter meaningful ones
const headerCandidates = lines
  .slice(0, 8)
  .filter(l =>
    l.length > 10 &&
    !/\d{3,}/.test(l) &&
    !/receipt|invoice|exam cashbook|rec.no|student id|date|roll no|fee type/i.test(l)
  );

// Combine top 2–3 lines
if (headerCandidates.length > 0) {
  merchantName = headerCandidates.slice(0, 3).join(" ");
}

merchantName = merchantName
  .replace(/\|/g, "")
  .replace(/\s+/g, " ")
  .trim();


  // 🔥 STEP 2 — FALLBACK SMART SEARCH
  if (merchantName === "Scanned Store") {
    for (let i = 0; i < Math.min(lines.length, 12); i++) {
      const line = lines[i];

      if (
        line.length > 5 &&
        !/\d{3,}/.test(line) &&
        !/invoice|gst|bill|receipt|date|phone|mobile|email|total|amount/i.test(line) &&
        !/chrome|google|format|pdf|http/i.test(line)
      ) {
        merchantName = line.replace(/[^\w\s&.'-]/g, "").trim();
   break;
      }
    }
  }
  /* ================= DATE ================= */

  let date = new Date().toISOString().split("T")[0];

  const dateMatch = text.match(/\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/);

  if (dateMatch) {
    const parts = dateMatch[0].split(/[\/\-]/);
    let day = parts[0];
    let month = parts[1];
    let year = parts[2];

    if (year.length === 2) year = "20" + year;

    date = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  /* ================= ITEMS ================= */

  const items = [];
  const itemRegex = /^([A-Za-z0-9 &().-]+?)\s+(\d+\.\d{2})$/;

  lines.forEach(line => {

    const match = line.match(itemRegex);

    if (match) {

      let rawPrice = match[2].replace(",", "");

      // Fix OCR removing decimal
      if (!rawPrice.includes(".")) {
        if (rawPrice.length > 3) {
          rawPrice = rawPrice.slice(0, -2) + "." + rawPrice.slice(-2);
        }
      }

      const price = parseFloat(rawPrice);
      const name = match[1].trim();

      if (
        price > 0 &&
        price < 100000 &&
        !/total|gst|tax|cgst|sgst|round off|change/i.test(name)
      ) {
        items.push({ name, price });
      }
    }
  });

  /* ================= WORDS TO NUMBER ================= */

  function wordsToNumber(words) {
    const numbers = {
      zero: 0, one: 1, two: 2, three: 3, four: 4,
      five: 5, six: 6, seven: 7, eight: 8, nine: 9,
      ten: 10, eleven: 11, twelve: 12, thirteen: 13,
      fourteen: 14, fifteen: 15, sixteen: 16,
      seventeen: 17, eighteen: 18, nineteen: 19,
      twenty: 20, thirty: 30, forty: 40,
      fifty: 50, sixty: 60, seventy: 70,
      eighty: 80, ninety: 90,
      hundred: 100,
      thousand: 1000,
      lakh: 100000,
      crore: 10000000
    };

    let result = 0;
    let current = 0;

    words = words.toLowerCase().replace(/only/g, "").trim();
    const parts = words.split(/\s+/);

    for (let word of parts) {

      if (numbers[word] !== undefined) {

        const value = numbers[word];

        if (value === 100) {
          current *= 100;
        } else if (value >= 1000) {
          current *= value;
          result += current;
          current = 0;
        } else {
          current += value;
        }
      }
    }

    return result + current;
  }

  /* ================= TOTAL DETECTION ================= */

  let totalAmount = 0;

  // 1️⃣ Check "In words"
 const wordsLine = lines.find(l => /in words\s*:/i.test(l));
console.log("WORDS LINE:", wordsLine);
  if (wordsLine) {
    const wordsPart = wordsLine.split(":")[1];
    if (wordsPart) {
      const numFromWords = wordsToNumber(wordsPart);
      if (numFromWords > 0) {
        totalAmount = numFromWords;
      }
    }
  }

  // 2️⃣ Numeric fallback
  // 2️⃣ Strong Numeric Detection
if (!totalAmount) {

  for (let line of lines) {

    if (/total|grand total|net amount|amount payable/i.test(line)) {

      const match = line.match(/(\d+(\.\d{2})?)/);

      if (match) {
        totalAmount = parseFloat(match[1]);
        break;
      }
    }
  }
}



if (!totalAmount) {

  const numbers = text.match(/\d{3,}/g);

  if (numbers) {

    const parsed = numbers.map(n => {

      if (n.length > 3) {
        return parseFloat(n.slice(0, -2) + "." + n.slice(-2));
      }

      return parseFloat(n);
    });

    totalAmount = Math.max(...parsed);
  }
}









// 3️⃣ If still not found → pick largest number in receipt
if (!totalAmount) {

  const numbers = text.match(/\d{3,}/g);

  if (numbers) {
    totalAmount = Math.max(...numbers.map(n => parseFloat(n)));
  }
}

  // 3️⃣ Final fallback → sum of items
  const itemsSum = items.reduce((sum, item) => sum + item.price, 0);

  if (!totalAmount && itemsSum > 0) {
  totalAmount = itemsSum;
}

  /* ================= CATEGORY ================= */

  const lower = text.toLowerCase();
  let category = "Other";

  if (/college|fees|library|exam|development/i.test(lower))
    category = "Education";
  else if (/restaurant|cafe|food|pizza|burger|hotel/i.test(lower))
    category = "Food";
  else if (/hospital|clinic|medical|pharma|medicine/i.test(lower))
    category = "Health";
  else if (/petrol|fuel|uber|ola|travel|bus|train/i.test(lower))
    category = "Transport";
  else if (/mart|mall|store|shopping|bazaar|supermarket/i.test(lower))
    category = "Shopping";

  return {
    merchantName,
    date,
    category,
    items,
    totalAmount
  };
}

module.exports = router;