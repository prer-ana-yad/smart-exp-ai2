import { useState } from "react";
import AddCategoryModal from "../components/AddCategoryModal";
import initialCategories from "../components/categoryData";

export default function AddCategoryPage() {

  // Load from localStorage if exists
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem("categories");
    return saved ? JSON.parse(saved) : initialCategories;
  });

  const handleSetCategories = (updated) => {
    setCategories(updated);
    localStorage.setItem("categories", JSON.stringify(updated));
  };

  return (
    <AddCategoryModal
      categories={categories}
      setCategories={handleSetCategories}
      onClose={() => window.history.back()}
    />
  );
}