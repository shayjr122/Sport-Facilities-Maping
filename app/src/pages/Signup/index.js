import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sign from "components/Sign";
import "components/Sign/Sign.css";
import src_image from "assets/icons/sign.png";
import axios from "axios";
const config = require("config.json");

function SignUp() {
  const navigate = useNavigate();
  const [userCred, setUserCred] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const form = {
    title: "הירשמו לפורטל",
    labels: ["שם מלא", "מייל", "סיסמה"],
    inputs: [
      {
        placeholder: "הכנס שם מלא",
        name: "fullName",
        type: "text",
        pattern: "^[a-zA-Z ]+$",
        title: "אותיות באנגלית בלבד, עם רווחים",
        required: true,
        value: userCred.fullName,
      },
      {
        placeholder: "הכנס מייל",
        name: "email",
        type: "email",
        title: "הכנס מייל",
        required: true,
        value: userCred.email,
      },
      {
        placeholder: "הכנס סיסמה",
        name: "password",
        type: "password",
        value: userCred.password,
        required: true,
        title: "הכנס סיסמה",
      },
    ],
    submit: "הירשם",
    src_image,
    user: [userCred, setUserCred],
  };
  const handle_signin = (e) => {
    window.location.href = window.location.href + "/../Signin";
  };
  return (
    <div>
      <div>
        <input
          className="logout-btn"
          type="submit"
          value={"התחבר"}
          onClick={handle_signin}
        />
      </div>
      <Sign
        {...form}
        onSubmit={async (user) => {
          // user = {
          //   token: localStorage.getItem("token"),
          //   ...user,
          //   ...user.selects.reduce((acc, obj) => {
          //     return { ...acc, ...obj };
          //   }, {}),
          // };
          // delete user.selects;
          // console.log(user);
          const { data } = await axios.post(`${config.api_host}/user/signup`, {
            email: userCred.email,
            password: userCred.password,
            fullName: userCred.fullName,
          });
          if (data.message == "User created successfully") {
            alert("user has been registered successfully");
            navigate("/signin");
          } else {
            alert("username already exists, try something else");
          }
        }}
      />
    </div>
  );
}
export default SignUp;
