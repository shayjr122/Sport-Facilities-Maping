import React, { useEffect, useState } from "react";
import Map from "components/Map";
import SearchBox from "components/SearchBox";
import "./Home.css";
import axios from "utils/api";
const placeholder = require("placeholders.json");

export default function Home() {
  const inputs = {
    searchBox: {
      placeholder: "לדוגמא: כדורסל תל-אביב",
    },
    spinners: [
      {
        placeholder: "רשות מקומית",
        items: placeholder["authorities"],
      },
      {
        placeholder: "סוג מתקן",
        items: placeholder["facility_type"],
      },
      {
        placeholder: "שם מתקן",
        items: placeholder["facility_name"],
      },
      {
        placeholder: "תאורה קיימת",
        items: placeholder["light"],
      },
      // {
      //   placeholder: "גידור קיים",
      //   items: placeholder["border"],
      // },
      {
        placeholder: "פנוי לפעילות",
        items: placeholder["available"],
      },
      {
        placeholder: "מספר תוצאות",
        items: placeholder["limit"],
      },
    ],
  };
  const [locations, setLocations] = useState([]);
  const [like_locations, setLikeLocations] = useState([]);
  const [startPosition, setStartPosition] = useState([31.646501, 34.932652]);

  useEffect(() => {
    console.log(1);
    const set_like_locations = async () => {
      try {
        const { data } = await axios.get("/facilities/like");
        setLikeLocations(data.results);
      } catch (error) {
        console.log(error);
      }
    };

    set_like_locations();
    console.log("like_locations", like_locations);
  }, []);
  useEffect(() => {
    console.log(2);
    const set_like_locations = async () => {
      try {
        const { data: db_data } = await axios.get("/facilities/like");
        if (db_data.length < like_locations.length) {
          console.log(
            "db_data.length < like_locations.length",
            db_data.length < like_locations.length
          );

          let add_location = like_locations.filter((location) =>
            db_data.results.some(
              (loc_in_db) =>
                loc_in_db.identification_number !==
                location.identification_number
            )
          )[0];
          if (db_data.length == 0 && like_locations.length == 1) {
            add_location = like_locations[0];
          }
          console.log("db", db_data);
          console.log("UI", like_locations);
          console.log("add_location", add_location);
          console.log(
            "add_location.identification_number",
            add_location.identification_number
          );
          const { data } = await axios.post("/facilities/like", null, {
            params: {
              facility_id: add_location.identification_number,
            },
          });
        } else if (db_data.length > like_locations.length) {
          console.log(
            "db_data.length > like_locations.length",
            db_data.length > like_locations.length
          );
          const del_location = db_data.results.filter((loc_in_db) =>
            like_locations.some(
              (location) =>
                loc_in_db.identification_number !==
                location.identification_number
            )
          )[0];
          console.log("del_location", del_location);
          // console.log("db_data", db_data);
          // console.log("like_locations", like_locations);

          const { data } = await axios.delete(
            "/facilities/unlike",

            {
              params: {
                facility_id: del_location.identification_number,
              },
            }
          );
        }
      } catch (error) {
        console.log(error);
      }
    };

    set_like_locations();
  }, [like_locations]);

  const handle_like_btn_state_change = async (state, id) => {
    if (state === 0) {
      try {
        console.log(state, id);
        // const { data } = await axios.get("/facilities/like");
      } catch (error) {
        console.log(error);
        console.log(state, id);
      }
    } else {
      console.log(state, id);
    }
  };
  const handle_search = async (filter) => {
    Object.keys(filter).forEach((key) => {
      if (filter[key] === "") delete filter[key];
    });
    console.log(JSON.stringify(filter));
    const params = {
      filters: JSON.stringify(filter),
      offset: 0,
      limit: 5,
    };
    try {
      const { data } = await axios.get("/facilities/filter", { params });
      setLocations(data.results);
      setStartPosition(data.results[0].geocode);
    } catch (error) {
      console.log(error);
    }
  };

  const handle_logout = (e) => {
    localStorage.clear();
    window.location.href = window.location.href + "/../Signin";
  };

  const handle_admin = (e) => {
    if (
      localStorage.getItem("role") === "admin" ||
      localStorage.getItem("role") === "ADMIN"
    ) {
      window.location.href = window.location.href + "/../adminPanel";
    }
  };
  const handle_user = (e) => {
    window.location.href = window.location.href + "/../user";
  };
  const handle_click = async (e) => {
    e.preventDefault();
    const clickedRow = e.target.closest("tr");
    const firstCell = clickedRow.querySelector("td:first-child");
    const content = firstCell.textContent;
    const filterByID = { "מספר זיהוי": content };

    const params = {
      filters: JSON.stringify(filterByID),
      offset: 0,
      limit: 1,
    };

    try {
      const { data } = await axios.get("/facilities/filter", { params });
      setLocations(data.results);
      const geocode = data.results[0].geocode;
      setStartPosition(geocode);
      console.log(geocode);
    } catch (error) {
      console.log(error);
    }
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
      </div>
      <div className="home-main-grid">
        <div className="half-grid">
          <div className="quart-grid-top">
            <div className="tableFixHead center">
              <SearchBox {...inputs} onSubmitCallback={handle_search} />
            </div>
          </div>
          <div className="cheat"></div>
          <div className="quart-grid-bottom">
            <div className="tableFixHead">
              <table>
                <thead>
                  <tr>
                    <th>מספר זיהוי</th>
                    <th>סוג מתקן</th>
                    <th>שם המתקן</th>
                    <th>רשות מקומית</th>
                    <th>טלפון איש קשר</th>
                    <th>דואל איש קשר</th>
                  </tr>
                </thead>
                <tbody>
                  {like_locations &&
                    like_locations.map &&
                    like_locations.map((location, key) => {
                      console.log(location);
                      return (
                        <tr
                          className="tr-hover"
                          onClick={handle_click}
                          key={key}
                        >
                          <td>{location.identification_number}</td>
                          <td>{location.facility_type}</td>
                          <td>{location.facility_name}</td>
                          <td>{location.local_authority}</td>

                          {!location.contact_person_phone ||
                          !location.contact_person_email ||
                          location.contact_person_phone === "" ||
                          location.contact_person_email === "" ? (
                            <>
                              <td>
                                יש ליצור קשר עם עיריית{" "}
                                {location.facility_owners}
                              </td>
                              <td>
                                יש ליצור קשר עם עיריית{" "}
                                {location.facility_owners}
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="eng">
                                {location.contact_person_phone}
                              </td>
                              <td className="eng">
                                {location.contact_person_email}
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="half-grid">
          <Map
            markers={locations}
            startPosition={startPosition}
            onLikeStateChange={handle_like_btn_state_change}
            like_locations={like_locations}
            setLikeLocations={setLikeLocations}
          />
        </div>
      </div>
    </div>
  );
}
