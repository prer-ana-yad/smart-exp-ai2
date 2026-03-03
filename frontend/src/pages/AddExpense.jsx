import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "./AddExpense.css";
import initialCategories from "../components/categoryData";
import CategorySheet from "../components/CategorySheet";
import DateModal from "../components/DateModal";
import ScanBill from "./ScanBill";

export default function AddExpense() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("manual");
  
  const [showCategory, setShowCategory] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const [categories, setCategories] = useState(initialCategories);

  

  const [form, setForm] = useState(() => {
    const saved = localStorage.getItem("expenseForm");
    return saved
      ? JSON.parse(saved)
      : {
          amount: "",
          category: "",
          currency: "INR",
          date: new Date(
            new Date().getTime() -
              new Date().getTimezoneOffset() * 60000
          )
            .toISOString()
            .split("T")[0],
          merchant: "",
          notes: ""
        };
  });

  useEffect(() => {
    if (!form.date) {
      const today = new Date(
        new Date().getTime() -
          new Date().getTimezoneOffset() * 60000
      )
        .toISOString()
        .split("T")[0];
      setForm(prev => ({ ...prev, date: today }));
    }
  }, []);

  useEffect(() => {
    const savedCategory = localStorage.getItem("selectedCategory");

    if (savedCategory) {
      setForm(prev => ({
        ...prev,
        category: savedCategory
      }));
      localStorage.removeItem("selectedCategory");
    }
  }, []);

  const handleSave = async () => {
    try {
      if (!form.amount || !form.category) {
        alert("Please enter amount and select category");
        return;
      }

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Session expired. Please login again.");
        navigate("/");
        return;
      }

      const payload = {
        ...form,
        amount: Number(form.amount),
        items: [],
        source: mode
      };
      console.log("Saving date:",form.date);

      await API.post("/expense", payload, {

        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const newExpense = {
  id: Date.now(),
  ...payload,
  createdAt: new Date().toISOString()
};









//Clear saved form
      localStorage.removeItem("expenseForm");
      navigate("/home");

    } catch (error) {
      console.log("SAVE ERROR:", error.response?.data || error);

      alert("Error saving expense. Check console.");

    }
  };

  const handleScan = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const res = await API.post("/ocr", formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "multipart/form-data"
      }
    });

    const data = res.data;

    await API.post("/expense", {
      amount: data.total,
      merchant: data.merchant,
      category: data.category,
      currency: "INR", 
      date: data.date,
      notes: "Scanned Receipt",
      items: data.items,
      source: "scan"
    },{
      headers:{
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    navigate("/home");
  };

  /* ================= VOICE ================= */

  const startVoice = () => {

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";

    recognition.onresult = async (event) => {

      const text = event.results[0][0].transcript.toLowerCase();
      console.log("Voice Input:", text);

      // ===== UNDO DELETE =====
if (text.includes("undo delete")) {

  try {
    await API.post("/expense/undo-delete", {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    alert("Undo successful ✅");
    navigate("/home");

  } catch (err) {
    alert("Nothing to undo");
  }

  return;
}


// ===== UPDATE LAST EXPENSE =====
if (text.includes("update last")) {

  const numberMatch = text.match(/\d+/);

  if (!numberMatch) {
    alert("Say: update last expense to 700");
    return;
  }

  const newAmount = Number(numberMatch[0]);

  try {
    await API.put("/expense/update-last", {
      newAmount
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    alert("Last expense updated ✅");
    navigate("/home");

  } catch (err) {
    alert("Update failed");
  }

  return;
}




      // ===== UPDATE AMOUNT =====
if (text.includes("update")) {

  const numbers = text.match(/\d+/g);

  if (numbers && numbers.length >= 2) {

    const oldAmount = Number(numbers[0]);
    const newAmount = Number(numbers[1]);

    try {
      await API.put("/expense/update-amount", {
        oldAmount,
        newAmount
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      alert("Expense Updated ✅");
      navigate("/home");

    } catch (err) {
      console.log(err);
      alert("Update failed");
    }
  } else {
    alert("Say like: update 500 to 700");
  }

  return;
}


// ===== DELETE LAST EXPENSE =====
if (text.includes("delete last")) {
  try {
    await API.delete("/expense/delete-last", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    alert("Last expense deleted ✅");
    navigate("/home");

  } catch (err) {
    console.log(err);
    alert("Delete failed");
  }
  return;
}



// ===== DELETE BY AMOUNT =====
if (text.includes("delete expense")) {

  const numberMatch = text.match(/\d+/);

  if (!numberMatch) {
    alert("Specify amount");
    return;
  }

  const amount = Number(numberMatch[0]);

  try {
    await API.delete(`/expense/delete-by-amount/${amount}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    alert("Expense deleted ✅");
    navigate("/dashboard");

  } catch (err) {
    alert("Delete failed");
  }

  return;
}

// ===== DELETE BY NAME =====
if (text.includes("delete") && text.includes("expense")) {

  const words = text.replace("delete", "").replace("expense", "").trim();

  try {
    await API.delete(`/expense/delete-by-merchant/${words}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    alert("Expense deleted ✅");
    navigate("/home");

  } catch (err) {
    alert("Delete failed");
  }

  return;
}
     


 
  
      

      






 const amountMatch = text.match(/\d+/);
      const amount = amountMatch ? Number(amountMatch[0]) : 0;

      if (!amount) {
        alert("Amount not detected");
        return;
      }
    
  
      

  
      // ===== IMPROVED DATE DETECTION =====

// ===== SAFE DATE DETECTION =====

let dateObj = new Date();

const monthMap = {
  january: 0, jan: 0,
  february: 1, feb: 1,
  march: 2, mar: 2,
  april: 3, apr: 3,
  may: 4,
  june: 5, jun: 5,
  july: 6, jul: 6,
  august: 7, aug: 7,
  september: 8, sep: 8,
  october: 9, oct: 9,
  november: 10, nov: 10,
  december: 11, dec: 11
};

// Remove st, nd, rd, th
const cleanedText = text.replace(/(\d+)(st|nd|rd|th)/g, "$1");

const words = cleanedText.split(" ");

for (let i = 0; i < words.length; i++) {

  const day = parseInt(words[i]);

  if (!isNaN(day) && day <= 31) {

    const nextWord = words[i + 1];

    if (monthMap[nextWord] !== undefined) {
      dateObj = new Date(
        new Date().getFullYear(),
        monthMap[nextWord],
        day
      );
      break;
    }
  }
}
if (text.includes("yesterday")) {
  dateObj.setDate(dateObj.getDate() - 1);
}

const date =
  dateObj.getFullYear() +
  "-" +
  String(dateObj.getMonth() + 1).padStart(2, "0") +
  "-" +
  String(dateObj.getDate()).padStart(2, "0");
      
      // ===== SMART CATEGORY DETECTION =====

let mainCategory = "OTHER";
let subCategory = "Miscellaneous";

const keywordMap = [

  

  // FOOD
  { keywords: ["fruit","fruits","vegetable","fish","chicken","meat","rice","milk","grocery","groceries","food"], main: "FOOD_DRINKS", sub: "Groceries" },
  { keywords: ["restaurant","hotel","dinner","lunch","breakfast"], main: "FOOD_DRINKS", sub: "Restaurants" },
  { keywords: ["coffee","tea","snack","snacks"], main: "FOOD_DRINKS", sub: "Coffee & Snacks" },
  { keywords: ["burger","pizza","kfc","mcdonald","pastry","cake","cafe"], main: "FOOD_DRINKS", sub: "Fast Food" },

  // TRANSPORT
  { keywords: ["petrol","fuel","diesel","hotel","travel insurance","vacation","visa & documentation"], main: "TRANSPORTATION", sub: "Fuel" },
  { keywords: ["uber","ola","taxi","cab","rapido"], main: "TRANSPORTATION", sub: "Taxi & Rides" },
  { keywords: ["bus","train","metro","flight","Parking","vehicle maintenance"], main: "TRANSPORTATION", sub: "Public Transport" },

  // SHOPPING
  { keywords: ["shirt","clothes","clothing","dress","shoes","trouser","jeans","myntra","flipkart","amazon","dmart","Accessories","earings","bangels","necklace","anklet","pant","nykaa","gold","shopping"], main: "SHOPPING", sub: "Clothing" },
  { keywords: ["mobile","laptop","electronics"], main: "SHOPPING", sub: "Electronics" },

  // HEALTH
  { keywords: ["doctor","hospital","clinic","gym fees","wellness & spa","health insurance"], main: "HEALTH", sub: "Doctor & Hospital" },
  { keywords: ["medicine","pharmacy","tablet","capsule"], main: "HEALTH", sub: "Pharmacy" },

  // EDUCATION
  { keywords: ["fees","college","school","exam","books","lab","stationary","tutoring","courses"], main: "EDUCATION", sub: "School Fees" },

  // ENTERTAINMENT
  { keywords: ["movie","cinema","netflix","prime amazon","jio hotstar","sony liv","events","birthday","anniversary","subscription","games","hobbies","drawing"], main: "ENTERTAINMENT", sub: "Movies & Shows" },

  // personal
  { keywords: ["personal care","gifts","charity","pet care","family","skin care products","hair care products","cosmetics"], main : "PERSONAL ", sub: "Personal" },

  //bill utilities 
  { keywords : ["electricity ","internet","wifi","jio recharge","mobile recharge ","rent","water","maintenance","gas bill","insurance"], main :"BILL_ UTILITIES" , sub:"Bill & Recharge"},

  //business
  {keywords:["office Supplies","software","business travel","marketing","professional service"], main: "BUSINESS" , sub : "Professional" },

];

for (let rule of keywordMap) {
  for (let word of rule.keywords) {
    if (text.includes(word)) {
      mainCategory = rule.main;
      subCategory = rule.sub;
      break;
    }
  }
}

      try{
        // ===== EXTRACT ITEM AFTER "on" =====
// Extract text after "on"

// Extract text after "on"
let merchant = text;

const itemMatch = text.match(/on (.+)/);
if (itemMatch) {
  merchant = itemMatch[1];
}

const notes = text;

await API.post("/expense", {
  amount,
  category: mainCategory,
  currency: "INR",
  date,                       // expense date
  createdAt: new Date().toISOString(),

  merchant,
  notes,
  items: [],
  source: "voice"
}, {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`
  }
});



  

         

        alert("Voice Expense Added ✅");
        navigate("/home");

      } catch (err) {
        console.log(err);
        alert("Error saving voice expense");
      }
    };

    recognition.start();
  };

  /* ================= UI ================= */

  return (
    <div className="add-wrapper">

      <div className="add-header">
        <span onClick={() => navigate(-1)}>←</span>
        <h2>Add Expense</h2>
      </div>

      <div className="toggle-pill">
        <button
          className={mode === "manual" ? "active" : ""}
          onClick={() => setMode("manual")}
        >
          Manual Add
        </button>

        <button
          className={mode === "scan" ? "active" : ""}
          onClick={() => setMode("scan")}
        >
          Scan Bill
        </button>

        <button
          className={mode === "voice" ? "active" : ""}
          onClick={() => setMode("voice")}
        >
          Voice
        </button>
      </div>

{/* ================= MANUAL ================= */}
      {mode === "manual" && (
        <div className="form-section">

          {/* Category Sheet */}
          {showCategory && (
            <CategorySheet
              categories={categories}
              setCategories={setCategories}
              onSelect={(category) => {
                setForm(prev => ({ ...prev, category }));
                setShowCategory(false);
              }}
              onClose={() => setShowCategory(false)}
            />
          )}

          {/* Amount */}
          <label>Amount (INR)</label>
          <input
            className="input-box"
            type="number"
            value={form.amount}
            onChange={(e) =>
              setForm(prev => ({ ...prev, amount: e.target.value }))
            }
          />

          {/* Category */}
          <label>Select Category</label>
<div
  className="category-pill"
  onClick={() => setShowCategory(true)}
>
  {form.category || "🔘 Select Category"}
</div>

          {/* Currency */}
          <label>Select Currency</label>
          <select
            className="input-box"
            value={form.currency}
            onChange={(e) =>
              setForm(prev => ({ ...prev, currency: e.target.value }))
            }
          >
            <option value="USD">🇺🇸 US Dollar (USD)</option>
            <option value="INR">🇮🇳 Indian Rupee (INR)</option>
            <option value="EUR">🇪🇺 Euro (EUR)</option>
            <option value="GBP">🇬🇧 British Pound (GBP)</option>
            <option value="JPY">🇯🇵 Japanese Yen (JPY)</option>
            <option value="AUD">🇦🇺 Australian Dollar (AUD)</option>
            <option value="CAD">🇨🇦 Canadian Dollar (CAD)</option>
            <option value="AED">🇦🇪 UAE Dirham (AED)</option>
            <option value="SGD">🇸🇬 Singapore Dollar (SGD)</option>
            <option value="CHF">🇨🇭 Swiss Franc (CHF)</option>
          </select>

          {/* Date */}
          <label>Select Date</label>
          <div
            className="date-pill"
            onClick={() => setShowDate(true)}
          >
            {form.date
              ? new Date(form.date).toDateString()
              : "📅 Select Date"}
          </div>

          {/* Merchant */}
          <label>Merchant Name</label>
          <input
            className="input-box"
            value={form.merchant}
            onChange={(e) =>
              setForm(prev => ({ ...prev, merchant: e.target.value }))
            }
          />

          {/* Notes */}
          <label>Notes / Description</label>
          <textarea
            className="textarea-box"
            value={form.notes}
            onChange={(e) =>
              setForm(prev => ({ ...prev, notes: e.target.value }))
            }
          />

          <button className="save-button" onClick={handleSave}>
            Save Transaction
          </button>
        </div>
      )}
{showDate && (
  <DateModal
    initialDate={form.date}
    onClose={() => setShowDate(false)}
    onSelect={(selectedDate) => {
      setForm((prev) => ({
        ...prev,
        date: selectedDate,
      }));
      setShowDate(false);
   
    }}
  
  />
)}




      {mode === "scan" && <ScanBill />}

      {mode === "voice" && (
        <div className="voice-section">
          <p>"Spent 450 rupees on food"</p>
          <p>"Spent 450 on 12th feb for cafe"</p>
          <button className="voice-btn" onClick={startVoice}>
            🎤 Start Listening
          </button>
        </div>
      )}

    </div>
  );
}