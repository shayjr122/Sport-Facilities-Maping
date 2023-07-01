import React, { useState } from "react";
import { Form } from "reactstrap";
import axios from "utils/api";
import search from "assets/icons/search.svg";
import downArrow from "assets/icons/downArrow.svg";
import "./SearchBox.css";
import DropdownList from "./DropdownList";

const SearchBox = ({ searchBox, spinners, onSubmitCallback }) => {
  const [spinnerState, setSpinnerState] = useState(-1);
  const [filter, setfilter] = useState({});
  const handle_submit = (e) => {
    e.preventDefault();
    onSubmitCallback && onSubmitCallback(filter);
  };
  const handle_change = (e, key) => {
    e.preventDefault();

    setfilter({ ...filter, [e.target.name]: e.target.value });
    setSpinnerState(key);
    console.log(filter);
  };
  const handle_change_q = (e) => {
    e.preventDefault();
    setfilter({ ...filter, ["q"]: e.target.value });
    console.log(filter);
  };

  return (
    <Form style={{ width: "100%" }} onSubmit={handle_submit}>
      {searchBox ? (
        <>
          <div className="my-input" onChange={(e) => handle_change_q(e)}>
            <input {...searchBox} />
            <img src={search} />
          </div>
        </>
      ) : (
        <></>
      )}

      {spinners.map((spinner, key) => (
        <div key={key} className="my-input drop-down">
          <div onChange={(e) => handle_change(e, key)}>
            <input
              placeholder={spinner.placeholder}
              autoComplete="off"
              name={spinner.placeholder}
              data-key={key}
              value={
                filter[spinner.placeholder] ? filter[spinner.placeholder] : ""
              }
            />
            <img
              src={downArrow}
              data-selected={
                key === spinnerState &&
                spinner.items &&
                spinner.items.some((item) =>
                  new RegExp(`^${filter[spinner.placeholder]}`).test(item)
                )
              }
              onClick={() => {
                console.log("click");
                setSpinnerState(key === spinnerState ? -1 : key);
              }}
              width="20px"
              height="20px"
              style={{ alignSelf: "center" }}
            />
          </div>
          {key === spinnerState && (
            <DropdownList
              items={spinner.items}
              field={spinner.placeholder}
              filter={filter}
              setfilter={setfilter}
              setSpinnerState={setSpinnerState}
            />
          )}
        </div>
      ))}
      <input className="search-btn" type="submit" value={"חפש"} />
    </Form>
  );
};
export default SearchBox;
