import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState,useEffect } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddExpense from "./pages/AddExpense";
import CategoryPage from "./pages/CategoryPage";
import AddCategoryPage from "./pages/AddCategoryPage";
import ScanBill from "./pages/ScanBill";
import Statistics from "./pages/Statistics";
import Settings from "./pages/Settings";
import BottomNav from "./components/BottomNav";

function LayoutWrapper({ children }) {
  const location = useLocation();


  // Hide bottom nav only on login page
  

const hideNavRoutes = [
  "/",
  "/add-expense",
  "/scan-bill"
];

const hideNav = hideNavRoutes.includes(location.pathname);



  return (
    <>
      {children}
      {!hideNav && <BottomNav />}
    </>
  );
}

function App() {

    const [expenses, setExpenses] = useState(() => {
  return JSON.parse(localStorage.getItem("expenses")) || [];
});

useEffect(() => {
  localStorage.setItem("expenses", JSON.stringify(expenses));
}, [expenses]);



const [income, setIncome] = useState(() => {
  return Number(localStorage.getItem("income")) || 0;
});

  return (
    <BrowserRouter>
      <LayoutWrapper>
        <Routes>

          {/* LOGIN PAGE */}
          <Route path="/" element={<Login />} />

          {/* HOME DASHBOARD */}
          <Route 
  path="/home" 
  element={
    <Dashboard 
      expenses={expenses}
      setExpenses={setExpenses}
      income={income}
      setIncome={setIncome}
    />
  } 
/>

          {/* STATISTICS */}
          <Route path="/statistics" element={<Statistics  expenses={expenses}   income={income}/>} />

          {/* SETTINGS */}
          
<Route 
  path="/settings" 
  element={
    <Settings 
      setExpenses={setExpenses}
      setIncome={setIncome}
    />
  } 
/>



          {/* OTHER PAGES */}
          
<Route 
  path="/add-expense" 
  element={<AddExpense />} 
/>
          <Route path="/categories" element={<CategoryPage />} />
          <Route path="/add-category" element={<AddCategoryPage />} />
          <Route path="/scan-bill" element={<ScanBill setExpenses={setExpenses} expenses={expenses} />} />

        </Routes>
      </LayoutWrapper>
    </BrowserRouter>
  );
}

export default App;