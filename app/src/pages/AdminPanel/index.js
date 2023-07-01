import React, { useEffect, useState } from "react";
import "./AdminPanel.css";
import SearchBox from "components/SearchBox";
import DropdownList from "components/SearchBox/DropdownList";
import axios from "utils/api";
import downArrow from "assets/icons/downArrow.svg";
import { Handler } from "leaflet";
export default function AdminPanel() {
  const [users, SetUsers] = useState([]);
  const [spinnerState, setSpinnerState] = useState(-1);
  const [usersToDelete, SetUsersToDelete] = useState([]);
  const options = ["admin", "user", "delete"];
  useEffect(() => {
    const set_users = async () => {
      try {
        const { data } = await axios.get("/admin/users");
        console.log(data);
        SetUsers(data.results);
        console.log("data.results", data.results);
      } catch (error) {
        console.log(error);
      }
    };

    set_users();
  }, []);
  const handle_user = (e) => {
    window.location.href = window.location.href + "/../user";
  };
  const handle_update_click = async (e) => {
    var update_users = [];
    for (let i = 0; i < users.length; i++) {
      var flag = true;
      const user = users[i];
      for (let i = 0; i < usersToDelete.length; i++) {
        const userToDel = usersToDelete[i];
        if (userToDel.email === user.email) {
          flag = false;
        }
      }
      if (flag) {
        update_users.push(user);
      }
    }

    console.log("usersToDelete", usersToDelete);
    console.log("users", update_users);
    e.preventDefault();
    if (update_users.length > 0) {
      await axios.post("/admin/users", update_users);
    }
    if (usersToDelete.length > 0) {
      await axios.delete("/admin/users", { data: usersToDelete });
    }
    try {
      const { data } = await axios.get("/admin/users");
      console.log(data);
      SetUsers(data.results);
      console.log("data.results", data.results);
    } catch (error) {
      console.log(error);
    }
    alert("הנתונים נשמרו בהצלחה");
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
          value={"פרטי משתמש"}
          onClick={handle_user}
        />
        <input
          className="logout-btn"
          type="submit"
          value={"התנתק"}
          onClick={handle_logout}
        />
        <input
          className="logout-btn"
          type="submit"
          value={"בית"}
          onClick={handle_home}
        />
      </div>
      <div className="admin-main-grid">
        <div className="admin-below-grid">
          <div className="tableFixHead">
            <table>
              <thead>
                <tr>
                  <th className="th-center">שם משתמש</th>
                  <th className="th-center">כתובת מייל</th>
                  <th className="th-center">תפקיד</th>
                </tr>
              </thead>
              <tbody>
                {users &&
                  users.map &&
                  users.map((user, key) => {
                    return (
                      <tr key={key}>
                        <td className="eng td-center">{user.fullName}</td>
                        <td className="eng td-center">{user.email}</td>
                        <td className="eng td-center">
                          <div key={key} className="admin-my-input">
                            {user.role}
                            <img
                              className="downArrow"
                              src={downArrow}
                              onClick={() => {
                                setSpinnerState(
                                  key === spinnerState ? -1 : key
                                );
                              }}
                              data-selected={key === spinnerState}
                            ></img>
                          </div>
                          <div className="drop-down-lst">
                            {key === spinnerState && (
                              <ul className="spinner-lst">
                                {options.map((item, key) => (
                                  <li
                                    key={key}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      const copy = [...users];
                                      const todelcopy = [...usersToDelete];
                                      if (options[key] == "delete") {
                                        if (!usersToDelete.includes(user)) {
                                          todelcopy.push(user);
                                          SetUsersToDelete(todelcopy);
                                          const i = copy.indexOf(user);
                                          copy[i].role = options[key];
                                          console.log(e);
                                          SetUsers(copy);
                                        }
                                        setSpinnerState(-1);
                                      } else {
                                        if (usersToDelete.includes(user)) {
                                          var filterd = todelcopy.filter(
                                            (del_user) =>
                                              del_user.email != user.email
                                          );
                                          SetUsersToDelete(filterd);
                                        }
                                        const i = copy.indexOf(user);
                                        copy[i].role = options[key];
                                        console.log(e);
                                        SetUsers(copy);
                                        setSpinnerState(-1);
                                      }
                                    }}
                                  >
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="cheat"></div>
        <div className="after">
          <input
            className="update-btn"
            type="submit"
            value={"עדכן"}
            onClick={handle_update_click}
          ></input>
        </div>
      </div>
    </div>
  );
}
