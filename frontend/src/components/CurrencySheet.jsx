import "./CurrencySheet.css";

const currencies = [
  { name: "US Dollar", code: "USD", flag: "🇺🇸", symbol: "$" },
  { name: "Indian Rupee", code: "INR", flag: "🇮🇳", symbol: "₹" },
  { name: "Euro", code: "EUR", flag: "🇪🇺", symbol: "€" },
  { name: "British Pound", code: "GBP", flag: "🇬🇧", symbol: "£" },
  { name: "Japanese Yen", code: "JPY", flag: "🇯🇵", symbol: "¥" },
  { name: "Australian Dollar", code: "AUD", flag: "🇦🇺", symbol: "$" },
  { name: "Canadian Dollar", code: "CAD", flag: "🇨🇦", symbol: "$" },
  { name: "UAE Dirham", code: "AED", flag: "🇦🇪", symbol: "د.إ" },
  { name: "Singapore Dollar", code: "SGD", flag: "🇸🇬", symbol: "$" },
  { name: "Swiss Franc", code: "CHF", flag: "🇨🇭", symbol: "CHF" }
];

export default function CurrencySheet({ onSelect, onClose, selected }) {
  return (
    <div className="currency-overlay" onClick={onClose}>
      <div
        className="currency-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="drag-bar" />

        <h2>Select Currency</h2>

        {currencies.map((cur) => {
          const isSelected = selected === cur.code;

          return (
            <div
              key={cur.code}
              className={`currency-row ${isSelected ? "selected" : ""}`}
              onClick={() => {
                onSelect(cur.code);
                onClose();
              }}
            >
              <div className="currency-left">
                <span className="flag">{cur.flag}</span>
                <span className="currency-name">
                  {cur.name}
                </span>
              </div>

              <div className="currency-right">
                <span className="currency-code">
                  {cur.code}
                </span>

                {isSelected && (
                  <span className="checkmark">✔</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}