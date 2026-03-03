import { useState } from "react";

const iconOptions = [
  "💡","📊","🏢","🛡️","📎","💻","🧳","📖","📚",
  "🎓","🎬","🎮","🛒","🍔","🚕","✈️","🏨","🎁"
];

const colorOptions = [
  "#2563EB","#7C2D12","#166534","#6B21A8",
  "#7F1D1D","#365314","#0C4A6E","#831843"
];

export default function AddCategoryModal({ onClose, categories = [], setCategories }) {

  const [group, setGroup] = useState("");
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [color, setColor] = useState("#2563EB");

  const handleSave = () => {
    if (!group || !name || !icon) {
      alert("Please fill all fields");
      return;
    }

    const updated = categories.map((g) =>
      g.name === group
        ? {
            ...g,
            items: [...g.items, { name, icon, color }]
          }
        : g
    );

    setCategories(updated);
    onClose();
  };

  return (
    <div className="sheet-overlay">
      <div className="sheet">

        {/* HEADER */}
        <div className="sheet-header">
          <h2>Add Category</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* PARENT GROUP */}
        <select
          className="input-box"
          value={group}
          onChange={(e) => setGroup(e.target.value)}
        >
          <option value="">Select Parent Group</option>
          {categories.map((g) => (
            <option key={g.name} value={g.name}>
              {g.name}
            </option>
          ))}
        </select>

        {/* CATEGORY NAME */}
        <input
          className="input-box"
          placeholder="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* ICON SELECTION */}
        <h4 style={{ marginTop: "20px" }}>Select Icon</h4>
        <div className="icon-grid">
          {iconOptions.map((i) => (
            <div
              key={i}
              className={`icon-box ${icon === i ? "active" : ""}`}
              onClick={() => setIcon(i)}
            >
              {i}
            </div>
          ))}
        </div>

        {/* COLOR SELECTION */}
        <h4 style={{ marginTop: "20px" }}>Select Color</h4>
        <div className="color-grid">
          {colorOptions.map((c) => (
            <div
              key={c}
              className={`color-box ${color === c ? "active-color" : ""}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>

        {/* SAVE BUTTON */}
        <button
          className="save-button"
          style={{ marginTop: "25px" }}
          onClick={handleSave}
        >
          Save Category
        </button>

      </div>
    </div>
  );
}
 