import { useState } from "react";
import "../pages/AddExpense.css";

export default function DateModal({ initialDate, onClose, onSelect }) {

  const parseDate = (dateStr) => {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const [selectedDate, setSelectedDate] = useState(parseDate(initialDate));

  const [currentMonth, setCurrentMonth] = useState(
    new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      1
    )
  );

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const emptySlots =
    firstDay > 0 ? Array.from({ length: firstDay }) : [];

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  return (
    <div className="sheet-overlay">
      <div className="sheet date-modal">

        <h3>Select date</h3>

        <div className="selected-date-big">
          {selectedDate.toDateString()}
        </div>

        {/* Month Navigation */}
        <div className="month-header">
          <button onClick={handlePrevMonth}>‹</button>
          <span>
            {currentMonth.toLocaleString("default", {
              month: "long",
            })}{" "}
            {year}
          </span>
          <button onClick={handleNextMonth}>›</button>
        </div>

        {/* Week Row */}
        <div className="week-row">
          {["S","M","T","W","T","F","S"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Calendar */}
        <div className="calendar-grid">
          {emptySlots.map((_, i) => (
            <div key={"empty" + i}></div>
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;

            const isSelected =
              selectedDate.getDate() === day &&
              selectedDate.getMonth() === month &&
              selectedDate.getFullYear() === year;

            return (
              <div
                key={day}
                className={`day ${isSelected ? "selected-day" : ""}`}
                onClick={() =>
                  setSelectedDate(new Date(year, month, day))
                }
              >
                {day}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="date-actions">
          <button onClick={onClose}>Cancel</button>
          <button
  onClick={() => {
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const d = String(selectedDate.getDate()).padStart(2, "0");

    const formattedDate = `${y}-${m}-${d}`;

    onSelect(formattedDate);
    onClose();
  }}
>
  OK
</button>
        </div>

      </div>
    </div>
  );
}