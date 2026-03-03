import React, { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import categoryData from "../components/categoryData";

export default function Statistics({ expenses = [], income = 0 }) {

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().getMonth()
  );

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

const [showAll, setShowAll] = useState(false);


  /* ================= FILTER BY MONTH ================= */

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const d = new Date(exp.createdAt);
      return d.getMonth() === selectedMonth;
    });
  }, [expenses, selectedMonth]);

  /* ================= TOTAL EXPENSE ================= */

  const totalExpense = useMemo(() => {
    return filteredExpenses.reduce(
      (sum, e) => sum + Number(e.amount || 0),
      0
    );
  }, [filteredExpenses]);

  /* ================= CATEGORY TOTALS ================= */

  const categoryTotals = useMemo(() => {
    const totals = {};

    filteredExpenses.forEach(exp => {
      totals[exp.category] =
        (totals[exp.category] || 0) + Number(exp.amount || 0);
    });

    return totals;
  }, [filteredExpenses]);

  /* ================= HIGHEST SPENDING ================= */

  const highestCategory = useMemo(() => {
    const entries = Object.entries(categoryTotals);
    if (entries.length === 0) return null;
    return entries.sort((a, b) => b[1] - a[1])[0];
  }, [categoryTotals]);

  /* ================= CHART DATA ================= */

  const chartData = Object.keys(categoryTotals).map(cat => ({
    name: cat,
    amount: categoryTotals[cat],
    color:
      categoryData.find(c => c.name === cat)?.color || "#4f8cff"
  }));










  const getCategoryColor = (categoryName) => {
  for (let group of categoryData) {
    const item = group.items.find(i => i.name === categoryName);
    if (item) return item.color;
  }



  return "#22d3ee"; // default fallback
};

const allItems = categoryData.flatMap(group => group.items);

  /* ================= UI ================= */

  return (
    <div className="statistics-page">

      <h2 className="stats-title">Statistics</h2>

      {/* ================= BALANCE CARD ================= */}
      
<div className="stats-header">

  <button
    className="month-btn"
    onClick={() =>
      setSelectedMonth(
        selectedMonth === 0 ? 11 : selectedMonth - 1
      )
    }
  >
    ◀
  </button>

  <h3 className="month-title">
    {monthNames[selectedMonth]}
  </h3>

  <button
    className="month-btn"
    onClick={() =>
      setSelectedMonth(
        selectedMonth === 11 ? 0 : selectedMonth + 1
      )
    }
  >
    ▶
  </button>

</div>

<div className="balance-compact">
 Total Balance : ₹ {(income - totalExpense).toLocaleString()}
</div>

      
      {/* ================= BAR CHART ================= */}

      


<div className="chart-wrapper" style={{ display: "flex", justifyContent: "center" }}>
  <ResponsiveContainer width="70%" height={260}>
    <BarChart
      data={chartData}
      barCategoryGap="40%"
    >
      <XAxis
        dataKey="name"
        tick={{ fill: "#94A3B8", fontSize: 12 }}
        axisLine={false}
        tickLine={false}
      />

      <YAxis
        tick={{ fill: "#64748B", fontSize: 11 }}
        axisLine={false}
        tickLine={false}
        strokeDasharray="3 3"
      />

      <Tooltip
        cursor={{ fill: "rgba(255,255,255,0.05)" }}
        contentStyle={{
          backgroundColor: "#0f172a",
          border: "none",
          borderRadius: "8px",
          color: "#fff"
        }}
      />

      <Bar
        dataKey="amount"
        radius={[20, 20, 0, 0]}
        barSize={35}
        animationDuration={1000}
      >
        {chartData.map((entry, index) => (
          <Cell
      key={`cell-${index}`}
      fill="#22d3ee"
      style={{
        filter: "drop-shadow(0px 0px 6px #22d3ee)"
      }}
    />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
</div>






      

      {/* ================= CATEGORY PROGRESS ================= */}

      {/* ================= CATEGORY PROGRESS ================= */}

{(showAll ? allItems : allItems.slice(0, 6)).map(item => {

  const total = categoryTotals[item.name] || 0;

  const percent =
    totalExpense > 0
      ? (total / totalExpense) * 100
      : 0;

  return (
    <div className="progress-row" key={item.name}>

      <div className="progress-header">
        <span className="cat-name">
          <span className="cat-icon">
            {item.icon}
          </span>
          {item.name}
        </span>

        <span>
           ₹ {total.toLocaleString()}
        </span>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{
            width: `${percent}%`,
            background: item.color,
            transition: "width 0.8s ease-in-out",
            borderRadius: "8px"
          }}
        />
      </div>






    </div>
  );
})}



<div style={{ textAlign: "center", marginTop: "15px" }}>
  <button
    onClick={() => setShowAll(!showAll)}
    style={{
      background: "transparent",
      border: "none",
      color: "#22d3ee",
      cursor: "pointer",
      fontWeight: "500"
    }}
  >
    {showAll ? "View Less ▲" : "View More ▼"}
  </button>
</div>








 </div>
  );
}