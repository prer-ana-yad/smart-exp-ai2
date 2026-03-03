import { useState, useEffect } from "react";
import { useNavigate,useLocation } from "react-router-dom";
import API from "../api";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import "./Dashboard.css";

export default function Dashboard({ expenses, setExpenses, income, setIncome }) {
  const navigate = useNavigate();

  const [showAllList, setShowAllList] = useState(false)


const location = useLocation();


const [tempIncome, setTempIncome] = useState("");


const [showKeypad, setShowKeypad] = useState(false);







  
  const [activeTab, setActiveTab] = useState("overview");
const [showCalendar, setShowCalendar] = useState(false);
const [selectedDate, setSelectedDate] = useState("");
const [showFilter, setShowFilter] = useState(false);
const [filterPeriod, setFilterPeriod] = useState("all");
const [sortOrder, setSortOrder] = useState(null);
const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");

const [minAmount, setMinAmount] = useState("");
const [maxAmount, setMaxAmount] = useState("");



  const [selectedDay, setSelectedDay] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [direction, setDirection] = useState(0);


const formatCurrency = (amount) =>
  Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });



const handleIncomeChange = (e) => {
    const value = Number(e.target.value);
    setIncome(value);
    localStorage.setItem("income", value);
  };


const handleKeyPress = (value) => {
  if (value === "del") {
    setTempIncome(prev => prev.slice(0, -1));
    return;
  }

  if (value === ".") {
    if (tempIncome.includes(".")) return;
  }

  setTempIncome(prev => prev + value);
};









useEffect(() => {
    let startY = 0;

    const handleTouchStart = (e) => {
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      const endY = e.changedTouches[0].clientY;
      if (endY - startY > 100) {
        setShowKeypad(false);
      }
    };

    const container = document.querySelector(".keypad-container");

    if (container) {
      container.addEventListener("touchstart", handleTouchStart);
      container.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
if (container) {
        container.removeEventListener("touchstart", handleTouchStart);
        container.removeEventListener("touchend", handleTouchEnd);
      }
    };
  }, [showKeypad]);









const totalExpense = expenses.reduce(
    (sum, exp) => sum + Number(exp.amount),
    0
  );

  const balance = income - totalExpense;













  useEffect(() => {
  fetchExpenses();
}, [location]);

  const fetchExpenses = async () => {
    try {
      const res = await API.get("/expense", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      setExpenses(
  res.data.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )
);
    } catch (err) {
      console.log("Fetch error:", err);
    }
  };


const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;

    try {
      await API.delete(`/expense/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      setExpenses(prev =>
  prev.filter(exp => Number(exp.id) !== Number(id))
);

    } catch (err) {
      console.log("Delete error:", err);
    }
  };


const handleEdit = async (expense) => {
    const newAmount = prompt("Edit Amount", expense.amount);
    if (!newAmount) return;

    try {
      await API.put(`/expense/${expense.id}`, {
        amount: newAmount,
        category: expense.category,
        merchant: expense.merchant,
        date: expense.date
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      setExpenses(prev =>
  prev.map(exp =>
    Number(exp.id) === Number(expense.id)
      ? { ...exp, amount: newAmount }
      : exp
  )
);
        
      

    } catch (err) {
      console.log("Update error:", err);
    }
  };















  /* ================= MONTH LOGIC ================= */

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const changeMonth = (dir) => {
    setDirection(dir);
    const newDate = new Date(currentDate);
    newDate.setMonth(month + dir);
    setCurrentDate(newDate);
    setSelectedDay(null);
  };

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonthCal = new Date(year, month + 1, 0).getDate();

   const getAmountForDay = (day) => {
  const dateStr = `${year}-${String(month + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

  return expenses
    .filter(exp => exp.date === dateStr)
    .reduce((sum, exp) => sum + Number(exp.amount), 0);
};
  

  const monthlyExpenses = expenses.filter(exp => {
  const [y, m] = exp.date.split("-");
  return Number(y) === year && Number(m) - 1 === month;
});
  const monthlyTotal = monthlyExpenses.reduce(
    (sum, exp) => sum + Number(exp.amount),
    0
  );
const selectedTransactions = selectedDay
  ? expenses.filter(exp => {
      const [y, m, d] = exp.date.split("-");
      return (
        Number(d) === selectedDay &&
        Number(m) - 1 === month &&
        Number(y) === year
      );
    })
  : [];



const [showAllRecent, setShowAllRecent] = useState(false);


const sortedTransactions = [...expenses]
  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

const recentTransactions = showAllRecent
  ? sortedTransactions
  : sortedTransactions.slice(0, 3);

  /* ================= SWIPE ANIMATION ================= */

 const variants = {
  enter: (dir) => ({
    x: dir > 0 ? "100%" : "-100%",
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (dir) => ({
    x: dir > 0 ? "-100%" : "100%",
    opacity: 0
  })
};

  /* ================= GRAPH DATA ================= */

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const graphData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dateStr =
      `${year}-${String(month + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

     const amount = expenses
  .filter(exp => exp.date === dateStr)
  .reduce((sum, exp) => sum + Number(exp.amount), 0);

    return { day, amount };
  });

  const categoryData = Object.values(
    expenses.reduce((acc, exp) => {
      if (!acc[exp.category]) {
        acc[exp.category] = { name: exp.category, value: 0 };
      }
      acc[exp.category].value += Number(exp.amount);
      return acc;
    }, {})
  );

  const COLORS = ["#4a6bff", "#9f6bff", "#ff6b6b", "#00c49f", "#ffbb28"];

  return (
     <div className="mobile-frame">
    <div className="dashboard-container">

      {/* TOP NAV */}
      <div className="top-tabs">
        <span
          className={activeTab==="overview"?"active":""}
          onClick={()=>setActiveTab("overview")}
        >
          Overview
        </span>

        <span
          className={activeTab==="spending"?"active":""}
          onClick={()=>setActiveTab("spending")}
        >
          Spending
        </span>

        <span
          className={activeTab==="list"?"active":""}
          onClick={()=>setActiveTab("list")}
        >
          List
        </span>
      </div>

      {activeTab==="overview" && (
        <>
          {/* Month Header with Arrows */}
          <div className="month-header">
            <button onClick={()=>changeMonth(-1)}>‹</button>
            <h2>
              {currentDate.toLocaleString("default",{month:"long"})} {year}
            </h2>
            <button onClick={()=>changeMonth(1)}>›</button>
          </div>

          {/* Swipe Animated Calendar */}
          <div
  style={{
    position: "relative",
    overflow: "hidden",
    width: "100%",
    minHeight:"480px"
  }}
>
  <AnimatePresence custom={direction} mode="wait">
    <motion.div
      key={`${year}-${month}`}
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.4 }}
      style={{
        position: "absolute",
        
        width: "100%",
        top: 0,
        left: 0
      }}
    >
      <div className="calendar-wrapper">
        <div className="week-days">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=>(
            <div key={d}>{d}</div>
          ))}
        </div>

        <div className="calendar-grid">
          {Array.from({ length: firstDay }).map((_,i)=>(
  <div key={"empty"+i} className="empty-cell"></div>
))}

          {Array.from({ length: daysInMonthCal }).map((_,i)=>{
            const day = i+1;
            const amount = getAmountForDay(day);

            const isToday =
              day === new Date().getDate() &&
              month === new Date().getMonth() &&
              year === new Date().getFullYear();

            return (
              <div
                key={day}
                onClick={()=>setSelectedDay(day)}
                className={`calendar-box 
                  ${isToday ? "today" : ""}
                  ${selectedDay===day ? "selected":""}
                `}
              >
                <span>{day}</span>
                {amount>0 && (
                  <small className="amount-text">
                    ₹{Number(amount).toLocaleString("en-IN")}
                  </small>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  </AnimatePresence>
</div>
          {/* Updated Label */}
          <div className="month-total">
            Total Expense for {currentDate.toLocaleString("default", { month: "long" })}: 
₹ {formatCurrency(monthlyTotal)}
          </div>
          {/* Selected Day Transactions */}
          {selectedDay && (
            <div style={{marginTop:"20px"}}>
              <h4>Transactions on {selectedDay}</h4>

              {selectedTransactions.length === 0 && (
                <p style={{opacity:0.6}}>No transactions</p>
              )}

              {selectedTransactions.map(exp=>(
                <div key={exp.id} className="transaction-card">
                  <div>
                    <strong>{exp.merchant}</strong>
                    <p>{exp.category}</p>
                  </div>
                  <h4>₹ {exp.amount}</h4>
                </div>
              ))}
            </div>
          )}

          {/* Recent Transactions */}














          <h3 style={{marginTop:"18px"}}>Recent Transactions</h3>

          {recentTransactions.map(exp => (
  <div key={exp.id} className="transaction-card">
  <div>
    <strong>{exp.merchant}</strong>
    <p>
      {exp.createdAt
        ? `${new Date(exp.createdAt).toLocaleDateString()} | 
           ${new Date(exp.createdAt).toLocaleTimeString([], {
             hour: "2-digit",
             minute: "2-digit"
           })}`
        : exp.date || "Date not available"}
    </p>
    <small>{exp.category}</small>
  </div>

  <div style={{ textAlign: "right" }}>
    <h4>₹ {formatCurrency(exp.amount)}</h4>

    <div style={{ marginTop: "6px" }}>
      <span
        style={{ cursor: "pointer", marginRight: "10px" }}
        onClick={() => handleEdit(exp)}
      >
        ✏️
      </span>

      <span
        style={{ cursor: "pointer", color: "#ff6b6b" }}
        onClick={() => handleDelete(exp.id)}
      >
        🗑
      </span>
    </div>
  </div>
</div>
))}



<div className="recent-header">
  
  {sortedTransactions.length > 3 && (
    <span
      className="view-toggle"
      onClick={() => setShowAllRecent(!showAllRecent)}
    >
      {showAllRecent ? "View Less" : "View More"}
    </span>
  )}
</div>











          {/* Graph */}
          <h3 style={{marginTop:"30px"}}>Monthly Trend</h3>

          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={graphData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={(value) => `₹ ${formatCurrency(value)}`} />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#4a6bff"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}

      {/* Spending & List remain same */}
      {activeTab==="spending" && (
       








        <>

        <div className="spending-stats">

  {/* INCOME INPUT CARD */}
  <div className="stat-card income">
  <div className="stat-icon">💰</div>
  <div>
    <p>Income</p>

    
<div 
  className="income-pill"
  onClick={() => {
    setTempIncome(String(income)); // preload current income
    setShowKeypad(true);
  }}
>
  ₹ {income}
</div>




  </div>
</div>

  {/* EXPENSE AUTO */}
  <div className="stat-card expense">
    <div className="stat-icon">💸</div>
    <div>
      <p>Expense</p>
      <h3>₹ {formatCurrency(totalExpense)}</h3>
    </div>
  </div>

  {/* BALANCE AUTO */}
  <div className="stat-card balance">
    <div className="stat-icon">🏦</div>
    <div>
      <p>Balance</p>
      <h3
  style={{ color: balance < 0 ? "#ff6b6b" : "#4a6bff" }}
>
  ₹ {formatCurrency(balance)}
</h3>
    </div>
  </div>

</div>

<div className="spending-summary">
  <div className="summary-icon">📈</div>
  <p>You’ve spent ₹{totalExpense} this month</p>
</div>


{showKeypad && (
  <div 
    className="keypad-overlay"
    onClick={() => setShowKeypad(false)}
  >
    <div
      className="keypad-container"
      onClick={(e) => e.stopPropagation()}
    >

      <div className="keypad-handle"></div>

      <div className="keypad-display">
         ₹ {tempIncome}
      </div>

      <div className="keypad-grid">
        {[1,2,3,4,5,6,7,8,9].map(num => (
          <button key={num} onClick={() => handleKeyPress(num)}>
            {num}
          </button>
        ))}

        <button onClick={() => handleKeyPress(".")}>.</button>
        <button onClick={() => handleKeyPress(0)}>0</button>
        <button onClick={() => handleKeyPress("del")}>⌫</button>
      </div>

      <button
  className="keypad-done"
  onClick={() => {

    if (tempIncome !== "") {
      const finalIncome = parseFloat(tempIncome);

      if (!isNaN(finalIncome)) {
        setIncome(finalIncome);
        localStorage.setItem("income", finalIncome);
      }
    }

    setShowKeypad(false);
    setTempIncome("");
  }}
>
  Done
</button>



    </div>
  </div>
)}



















          <h3>Category Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                outerRadius={90}
                label
              >
                {categoryData.map((entry,index)=>(
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </>
      )}

     
     
{activeTab === "list" && (


  <>


  
    {/* ================= FILTER CHIPS ================= */}
    <div className="list-filters">
      <div className="modal-handle"></div>

      {["today","thisMonth","lastMonth","last3Months"].map(period => (
        <button
          key={period}
          className={`filter-chip ${filterPeriod === period ? "active-chip" : ""}`}
          onClick={() => {
  setFilterPeriod(period);
  setSelectedDate("");   // 🔥 ADD THIS LINE
  setStartDate("");
  setEndDate("");
  setShowAllList(false);
}}
        >
          {period === "today" && "Today"}
          {period === "thisMonth" && "This Month"}
          {period === "lastMonth" && "Last Month"}
          {period === "last3Months" && "Last 3 Months"}
        </button>
      ))}

      <button
        className={`filter-chip ${showFilter ? "active-chip" : ""}`}
        onClick={() => setShowFilter(true)}
      >
        Filters
      </button>

    </div>

    {/* ================= FILTER + SORT LOGIC ================= */}
    {(() => {

      let filteredExpenses = [...expenses];
      const now = new Date();

      const isSameDate = (d1, d2) =>
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();

      // TODAY
      
if (filterPeriod === "today") {
  const today = new Date();
  const todayStr =
    today.getFullYear() +
    "-" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(today.getDate()).padStart(2, "0");

  filteredExpenses = filteredExpenses.filter(
    exp => exp.date === todayStr
  );
}


// SPECIFIC DATE FILTER
// SPECIFIC DATE FILTER
if (selectedDate) {
  filteredExpenses = filteredExpenses.filter(
    exp => exp.date === selectedDate
  );
}











      // THIS MONTH
      if (filterPeriod === "thisMonth") {
        filteredExpenses = filteredExpenses.filter(exp => {
          const d = new Date(exp.date);
          return d.getMonth() === now.getMonth() &&
                 d.getFullYear() === now.getFullYear();
        });
      }

      // LAST MONTH
      if (filterPeriod === "lastMonth") {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
        filteredExpenses = filteredExpenses.filter(exp => {
          const d = new Date(exp.date);
          return d.getMonth() === lastMonth.getMonth() &&
                 d.getFullYear() === lastMonth.getFullYear();
        });
      }

      // LAST 3 MONTHS
      if (filterPeriod === "last3Months") {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(now.getMonth() - 3);

  filteredExpenses = filteredExpenses.filter(exp =>
    new Date(exp.date) >= threeMonthsAgo
  );
}

      // CUSTOM DATE RANGE
      if (startDate && endDate) {
        const start = new Date(startDate);
        start.setHours(0,0,0,0);

        const end = new Date(endDate);
        end.setHours(23,59,59,999);

        filteredExpenses = filteredExpenses.filter(exp => {
          const d = new Date(exp.date);
          return d >= start && d <= end;
        });
      }

      // MIN AMOUNT
      if (minAmount) {
        filteredExpenses = filteredExpenses.filter(
          exp => Number(exp.amount) >= Number(minAmount)
        );
      }

      // MAX AMOUNT
      if (maxAmount) {
        filteredExpenses = filteredExpenses.filter(
          exp => Number(exp.amount) <= Number(maxAmount)
        );
      }

      // SORTING
      if (sortOrder === "lowHigh") {
        filteredExpenses.sort((a,b) => a.amount - b.amount);
      } else if (sortOrder === "highLow") {
        filteredExpenses.sort((a,b) => b.amount - a.amount);
      } else {
        filteredExpenses.sort(
          (a,b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      }

      const displayExpenses = showAllList
        ? filteredExpenses
        : filteredExpenses.slice(0, 3);

      // EMPTY STATE
      if (filteredExpenses.length === 0) {
        return (
          <p style={{
            textAlign:"center",
            marginTop:"60px",
            opacity:0.6
          }}>
            No transactions found
          </p>
        );
      }

      return (
        <>
          {displayExpenses.map(exp => (
  <div key={exp.id} className="transaction-card">
    <div>
      <strong>{exp.merchant}</strong>
      <p>
        {exp.createdAt
          ? `${new Date(exp.createdAt).toLocaleDateString()} | 
             ${new Date(exp.createdAt).toLocaleTimeString([], {
               hour: "2-digit",
               minute: "2-digit"
             })}`
          : exp.date || "Date not available"}
      </p>
      <small>{exp.category}</small>
    </div>

    <div style={{ textAlign: "right" }}>
      <h4>₹ {formatCurrency(exp.amount)}</h4>

      <div style={{ marginTop: "6px" }}>
        <span
          style={{ cursor: "pointer", marginRight: "10px" }}
          onClick={() => handleEdit(exp)}
        >
          ✏️
        </span>

        <span
          style={{ cursor: "pointer", color: "#ff6b6b" }}
          onClick={() => handleDelete(exp.id)}
        >
          🗑
        </span>
      </div>
    </div>
  </div>
))}
          

          {filteredExpenses.length > 3 && (
            <div
              className="view-toggle"
              onClick={() => setShowAllList(!showAllList)}
            >
              {showAllList ? "View Less" : "View More"}
            </div>
          )}
        </>
      );
    })()}

    {/* ================= FILTER MODAL ================= */}
    {showFilter && (
      <div className="filter-overlay" onClick={() => setShowFilter(false)}>
        <div
          className="filter-modal"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h3>Filter Expenses</h3>
            <span onClick={() => setShowFilter(false)}>✕</span>
          </div>

          <div className="date-row">
            <input
              type="date"
              value={startDate}
              onChange={(e)=>setStartDate(e.target.value)}
            />
            <input
              type="date"
              value={endDate}
              onChange={(e)=>setEndDate(e.target.value)}
            />
          </div>





<div style={{ marginTop: "15px" }}>
  <label style={{ fontSize: "13px", opacity: 0.7 }}>
    Filter by Specific Date
  </label>
<input
  type="date"
  value={selectedDate}
  onChange={(e) => {
    setSelectedDate(e.target.value);
    setFilterPeriod("all");   // 🔥 ADD THIS LINE
  }}
/>
</div>


<button
  className="calendar-btn"
  onClick={() => setShowCalendar(true)}
>
  📅 Pick Date
</button>



          <input
            type="number"
            placeholder="Min Amount"
            value={minAmount}
            onChange={(e)=>setMinAmount(e.target.value)}
          />

          <input
            type="number"
            placeholder="Max Amount"
            value={maxAmount}
            onChange={(e)=>setMaxAmount(e.target.value)}
          />

          <div className="sort-row">
            <button
              className={sortOrder==="lowHigh" ? "active-sort":""}
              onClick={()=>setSortOrder("lowHigh")}
            >
              Low → High
            </button>

            <button
              className={sortOrder==="highLow" ? "active-sort":""}
              onClick={()=>setSortOrder("highLow")}
            >
              High → Low
            </button>
          </div>

          <div className="modal-actions">
            <button
              className="clear-btn"
              onClick={()=>{
                setFilterPeriod("all");
                setStartDate("");
                setEndDate("");
                setSelectedDate("");
                setMinAmount("");
                setMaxAmount("");
                setSortOrder(null);
              }}
            >
              Clear Filters
            </button>

            <button
              className="apply-btn"
              onClick={()=>setShowFilter(false)}
            >
              Apply Filters
            </button>
          </div>

        </div>
      </div>
    )}
  </>
)}


{showCalendar && (
  <div
    className="calendar-overlay"
    onClick={() => setShowCalendar(false)}
  >
    <div
      className="calendar-container"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="calendar-header">
        <span>Select Date</span>
        <span onClick={() => setShowCalendar(false)}>✕</span>
      </div>

      <input
        type="date"
        value={selectedDate}
        onChange={(e) => {
          setSelectedDate(e.target.value);
          setShowCalendar(false);
        }}
        className="calendar-input"
      />
    </div>
  </div>
)}
















<div
        className="floating-btn"
        onClick={()=>navigate("/add-expense")}
      >
        +
      </div>

    </div>
    </div>
  );
}





































































































     
      
            
      


