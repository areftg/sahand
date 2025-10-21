import React, { useState, useEffect, useRef } from "react";
import style from "./DropDown.module.css";
import drop from "../../assets/icons/Drop.svg";

const Dropdown = ({ options, onSelect, defaultValue }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(defaultValue || null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (option) => {
    setSelected(option);
    setIsOpen(false);
    if (onSelect) {
      onSelect(option);
    }
  };

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className={style.main}>
      <div onClick={toggleDropdown} className={style.container}>
        <img className={isOpen ? style.rotated : ""} src={drop} alt="" />
        <button className={style.button}>
          {selected ? selected.label : "انتخاب کنید"}
        </button>
      </div>
      <ul className={`${style.options} ${isOpen ? style.show : style.hide}`}>
        {options.map((option) => (
          <li
            className={style.option}
            key={option.value}
            onClick={() => handleSelect(option)}
          >
            <div className={style.circle}>
              {selected && selected.value === option.value && (
                <div className={style.filled}></div>
              )}
            </div>
            {option.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dropdown;
