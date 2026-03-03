import { useState } from "react";
import AddCategoryModal from "./AddCategoryModal";

export default function CategorySheet({ onClose, onSelect, categories, setCategories }) {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <>
      <div className="sheet-overlay">
        <div className="sheet">

          <div className="sheet-header">
            <h2>Categories</h2>
            <div>
              <button onClick={() => setShowAdd(true)}>＋</button>
              <button onClick={onClose}>✕</button>
            </div>
          </div>

          {categories.map((group) => (
            <div key={group.name} className="category-group">
              <h3 className="group-title">{group.name}</h3>

              {group.items.map((item) => (
                <div
                  key={item.name}
                  className="category-card"
                  style={{ background: item.color }}
                  onClick={() => {
                    onSelect(item.name);
                    onClose();
                  }}
                >
                  <div className="category-icon">{item.icon}</div>
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          ))}

        </div>
      </div>

      {showAdd && (
        <AddCategoryModal
          onClose={() => setShowAdd(false)}
          categories={categories}
          setCategories={setCategories}
        />
      )}
    </>
  );
}