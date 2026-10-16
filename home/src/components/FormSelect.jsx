import { useEffect, useRef, useState } from "react";
import {
  FaBolt,
  FaBroom,
  FaCheck,
  FaChevronDown,
  FaMapMarkerAlt,
  FaTools,
  FaUserTie,
  FaWrench,
} from "react-icons/fa";

function FormSelect({ id, value, onChange, placeholder, options, name, className = "" }) {
  const [open, setOpen] = useState(false);
  const selectRef = useRef(null);
  const selected = options.find((option) => String(option.value) === String(value));

  const getOptionIcon = (label = "") => {
    const normalized = label.toLowerCase();
    if (name === "service" && /electric|electricity|lightning/.test(normalized)) return FaBolt;
    if (name === "service" && /clean|broom/.test(normalized)) return FaBroom;
    if (name === "service" && /plumb|repair|maintenance/.test(normalized)) return FaWrench;
    if (name === "professional") return FaUserTie;
    if (name === "address") return FaMapMarkerAlt;
    return FaTools;
  };

  const getOptionLabel = (label = "") => name === "service"
    ? label.replace(/\b\w/g, (character) => character.toUpperCase())
    : label;

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!selectRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  return (
    <div className={`bk-custom-select ${className}`} ref={selectRef}>
      <button
        type="button"
        id={id}
        className={`bk-select-trigger ${open ? "is-open" : ""}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={name}
        onClick={() => setOpen((isOpen) => !isOpen)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <span className={selected ? "" : "bk-select-placeholder"}>{selected?.label || placeholder}</span>
        <FaChevronDown className="bk-select-chevron" aria-hidden="true" />
      </button>
      {open && (
        <div className="bk-select-menu" role="menu" aria-label={name}>
          {options.map((option) => {
            const OptionIcon = getOptionIcon(option.label);
            const isSelected = String(option.value) === String(value);
            return (
              <button
                type="button"
                role="menuitemradio"
                aria-checked={isSelected}
                className={`bk-select-option ${isSelected ? "is-selected" : ""}`}
                key={option.value}
                onClick={() => {
                  onChange({ target: { value: option.value } });
                  setOpen(false);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") setOpen(false);
                }}
              >
                <span className="bk-option-main">
                  <span className="bk-option-icon"><OptionIcon aria-hidden="true" /></span>
                  <span className="bk-option-label">{getOptionLabel(option.label)}</span>
                </span>
                {isSelected && <FaCheck className="bk-option-check" aria-hidden="true" />}
              </button>
            );
          })}
          {options.length === 0 && <p className="bk-select-empty">No {name.toLowerCase()} available</p>}
        </div>
      )}
    </div>
  );
}

export default FormSelect;
