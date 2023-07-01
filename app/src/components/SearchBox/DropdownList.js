import React, { useState } from "react";
import { Form, Input } from "reactstrap";
import search from "assets/icons/search.svg";
import downArrow from "assets/icons/downArrow.svg";
import "./SearchBox.css";

const DropdownList = ({ items, filter, setfilter, field, setSpinnerState }) => {
  return (
    items &&
    items.length && (
      <ul className="spinner-list">
        {items
          .filter(
            (item) =>
              new RegExp(`^${filter[field]}`).test(item) && filter[field] !== ""
          )
          .map((item, key) => (
            <li
              key={key}
              onClick={(e) => {
                e.preventDefault();
                setfilter({ ...filter, [field]: item });
                setSpinnerState(-1);
              }}
            >
              {item}
            </li>
          ))}
      </ul>
    )
  );
};
export default DropdownList;
