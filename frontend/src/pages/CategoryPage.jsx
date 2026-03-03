import { useNavigate } from "react-router-dom";
import { useState } from "react";
import initialCategories from "../components/categoryData";
import "./AddExpense.css";

export default function CategoryPage() {
  const navigate = useNavigate();

  // 🔥 Load categories from localStorage
  const [categories] = useState(() => {
    const saved = localStorage.getItem("categories");
    return saved ? JSON.parse(saved) : initialCategories;
  });

  const handleSelect = (category) => {
    localStorage.setItem("selectedCategory", category);
    navigate(-1);
  };

  return (
    <div className="add-wrapper">

      {/* HEADER */}
      <div className="add-header">
        <span onClick={() => navigate(-1)}>←</span>
        <h2>Categories</h2>
      </div>

      <div className="sheet">

        {/* ADD BUTTON */}
        <div className="sheet-header">
          <button onClick={() => navigate("/add-category")}>
            ＋ Add
          </button>
        </div>

        {/* CATEGORY LIST */}
        {categories.map((group) => (
          <div key={group.name} className="category-group">
            <h3>{group.name}</h3>

            {group.items.map((item) => (
              <div
                key={item.name}
                className="category-card"
                style={{ background: item.color }}
                onClick={() => handleSelect(item.name)}
              >
                <div className="category-icon">
                  {item.icon}
                </div>
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        ))}

      </div>
    </div>
  );
}