import API from "../api";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
export default function Settings({setExpenses,setIncome}) {

  const navigate = useNavigate();
  const user = localStorage.getItem("userName") || "User";

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

const handleExport = () => {
  const expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  const income = Number(localStorage.getItem("income")) || 0;

  const data = expenses.map((exp) => ({
    Date: exp.createdAt,
    Category: exp.category,
    Amount: exp.amount,
  }));

  data.unshift({
    Date: "Income",
    Category: "",
    Amount: income,
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "BudgetData");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const file = new Blob([excelBuffer], {
    type: "application/octet-stream",
  });

  saveAs(file, "BudgetData.xlsx");
};




const handleImport = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (evt) => {
    const data = new Uint8Array(evt.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(sheet);

    const importedIncome = json.find(row => row.Date === "Income")?.Amount || 0;
    const importedExpenses = json
      .filter(row => row.Date !== "Income")
      .map(row => ({
        createdAt: row.Date,
        category: row.Category,
        amount: row.Amount,
      }));

    localStorage.setItem("income", importedIncome);
    localStorage.setItem("expenses", JSON.stringify(importedExpenses));

    alert("Data Imported Successfully!");
    window.location.reload();
  };

  reader.readAsArrayBuffer(file);
};



const handleReset = async () => {
  try {
    await API.delete("/expense/reset-all", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    localStorage.removeItem("income");

    alert("All data reset successfully");

    window.location.reload(); // refresh whole app

  } catch (error) {
    console.log(error);
  }
};



  return (
    <div className="settings-page">

      <h2>Settings</h2>

      <div className="user-card">
        <h3>👋 Hello, {user}</h3>
        <p>Save your Expenses smartly!</p>
      </div>

      <div className="settings-card">

        <div className="settings-item" onClick={handleExport}>
  <p>Export Data</p>
</div>

        <div className="settings-item">
  <label style={{ cursor: "pointer" }}>
    <p>Import Data</p>
    <input
      type="file"
      accept=".xlsx, .xls"
      onChange={handleImport}
      hidden
    />
  </label>
</div>

        <div className="settings-item danger" onClick={handleReset}>
  <p>Reset All Data</p>
</div>

        <div className="settings-item logout" onClick={handleLogout}>
          <p>Logout</p>
        </div>

      </div>

    </div>
  );
}