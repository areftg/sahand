import React, { useState, useEffect, useRef } from 'react'; // useRef و useEffect را اضافه کنید
import './TextEditor.css';
import { ReactComponent as FaBold } from "../../assets/icons/FaBold.svg";
import { ReactComponent as FaItalic } from "../../assets/icons/FaItalic.svg";
import { ReactComponent as FaUnderline } from "../../assets/icons/FaUnderline.svg";
import { ReactComponent as FaStrikethrough } from "../../assets/icons/FaStrikethrough.svg";
import { ReactComponent as FaAlignLeft } from "../../assets/icons/FaAlignLeft.svg";
import { ReactComponent as FaAlignCenter } from "../../assets/icons/FaAlignCenter.svg";
import { ReactComponent as FaAlignRight } from "../../assets/icons/FaAlignRight.svg";
// import { ReactComponent as FaAlignJustify } from "../../assets/icons/FaAlignJustify.svg"; // برای دکمه justify

const TextEditor = ({ initialContent = '', onContentChange }) => {
  const [activeButtons, setActiveButtons] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    align: 'right'
  });


  const contentEditableRef = useRef(null);


  useEffect(() => {

    if (contentEditableRef.current && initialContent !== contentEditableRef.current.innerHTML) {
      contentEditableRef.current.innerHTML = initialContent;
    }
  }, [initialContent]); // این effect فقط زمانی اجرا می‌شود که initialContent تغییر کند

  const handleInput = (e) => {
    if (onContentChange) {
      onContentChange(e.currentTarget.innerHTML);
    }
  };

  const handleFormatClick = (format, value = null) => {
    if (format === 'align') {
      setActiveButtons(prev => ({ ...prev, align: value }));
      document.execCommand(`justify${value.charAt(0).toUpperCase() + value.slice(1)}`, false, null);
    } else {
      setActiveButtons(prev => ({ ...prev, [format]: !prev[format] }));
      document.execCommand(format, false, null);
    }
  };

  return (
    <div className="editor-container">
      <div

        ref={contentEditableRef}
        className="text-area"
        contentEditable="true"
        data-placeholder="...متن را وارد کنید"
        onInput={handleInput}
      ></div>
      <div className="toolbar">
        <button className={`toolbar-button ${activeButtons.bold ? 'active' : ''}`} onClick={() => handleFormatClick('bold')}><FaBold /></button>
        <button className={`toolbar-button ${activeButtons.italic ? 'active' : ''}`} onClick={() => handleFormatClick('italic')}><FaItalic /></button>
        <button className={`toolbar-button ${activeButtons.underline ? 'active' : ''}`} onClick={() => handleFormatClick('underline')}><FaUnderline /></button>
        <button className={`toolbar-button ${activeButtons.strikethrough ? 'active' : ''}`} onClick={() => handleFormatClick('strikethrough')}><FaStrikethrough /></button>
        <div className="separator"></div>
        <button className={`toolbar-button ${activeButtons.align === 'left' ? 'active' : ''}`} onClick={() => handleFormatClick('align', 'left')}><FaAlignLeft /></button>
        <button className={`toolbar-button ${activeButtons.align === 'center' ? 'active' : ''}`} onClick={() => handleFormatClick('align', 'center')}><FaAlignCenter /></button>
        <button className={`toolbar-button ${activeButtons.align === 'right' ? 'active' : ''}`} onClick={() => handleFormatClick('align', 'right')}><FaAlignRight /></button>
        {/* <button ...><FaAlignJustify /></button> */}
      </div>
    </div>
  );
};

export default TextEditor;