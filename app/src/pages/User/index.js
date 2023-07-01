import React, { useEffect, useState } from "react";
import "./User.css";
import src_image from "assets/icons/user.png";

import axios from "utils/api";
export default function AdminPanel() {
  const [user, SetUser] = useState([]);
  useEffect(() => {
    const set_user = async () => {
      try {
        const { data } = await axios.get("/user");
        console.log(data);
        SetUser(data.results[0]);
        console.log("data.results", data.results);
      } catch (error) {
        console.log(error);
      }
    };

    set_user();
  }, []);

  const handle_admin = (e) => {
    if (
      localStorage.getItem("role") === "admin" ||
      localStorage.getItem("role") === "ADMIN"
    ) {
      window.location.href = window.location.href + "/../adminPanel";
    }
  };
  const handle_home = (e) => {
    window.location.href = window.location.href + "/../Home";
  };
  const handle_logout = (e) => {
    localStorage.clear();
    window.location.href = window.location.href + "/../Signin";
  };

  return (
    <div className="all">
      <div>
        <input
          className="logout-btn"
          type="submit"
          value={"התנתק"}
          onClick={handle_logout}
        />
        {localStorage.getItem("role") === "admin" ||
        localStorage.getItem("role") === "ADMIN" ? (
          <input
            className="logout-btn"
            type="submit"
            value={"ניהול"}
            onClick={handle_admin}
          />
        ) : (
          <></>
        )}
        <input
          className="logout-btn"
          type="submit"
          value={"בית"}
          onClick={handle_home}
        />
      </div>
      <div className="user-main-grid">
        <div className="user-below-grid">
          {user ? (
            <div className="user-container">
              <div className="img-container">
                <img className="img-user" src={src_image}></img>
              </div>
              <div className="user-details">
                <div className="lable">שם</div>
                <div className="input-user">{user.fullName}</div>
                <div className="lable">מייל</div>
                <div className="input-user">{user.email}</div>
                <div className="lable">תפקיד</div>
                <div className="input-user">{user.role}</div>
              </div>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
}
