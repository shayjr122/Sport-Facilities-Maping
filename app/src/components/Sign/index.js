import React, { useState } from "react";
import { Button, Input, Form, Label } from "reactstrap";
import { useNavigate } from "react-router-dom";
import "./Sign.css";

const Sign = ({
  title,
  labels,
  inputs,
  radioGroups,
  submit,
  src_image,
  user,
  onSubmit,
}) => {
  const navigate = useNavigate();
  const [userCred, setUserCred] = user;

  const handle_change = (e) => {
    e.preventDefault();
    const new_cred = { ...userCred };
    new_cred[e.target.name] = e.target.value;
    setUserCred({ ...userCred, [e.target.name]: e.target.value });
    // setUserCred({new_cred});
  };

  const handle_submit = async (e) => {
    e.preventDefault();
    onSubmit(userCred);
  };

  return (
    <div>
      <Form className="sign-form" onSubmit={handle_submit}>
        <div>
          <h1>{title}</h1>
          {radioGroups && (
            <div className="inputs-container">
              {radioGroups.length &&
                radioGroups.map((group, group_index) => (
                  <fieldset key={group_index}>
                    <legend>{group.title}</legend>

                    {group.radios.map((radio, index) => (
                      <div key={index} className="mx-1">
                        <input
                          {...radio}
                          type="radio"
                          name={group.name}
                          value={radio}
                          checked={
                            radio === userCred.selects[group_index][group.name]
                          }
                          onChange={(e) => {
                            const selects = [...userCred.selects];
                            selects[group_index][group.name] = e.target.value;
                            console.log({ ...userCred, selects });
                            setUserCred({ ...userCred, selects });
                          }}
                        />
                        {` ${radio}`}
                      </div>
                    ))}
                  </fieldset>
                ))}
            </div>
          )}
          <div className="inputs-container" onChange={handle_change}>
            {inputs &&
              inputs.map((input, index) => (
                <div key={index}>
                  <Label>{labels[index]}</Label>
                  <Input key={index} {...input} />
                </div>
              ))}
          </div>
          <Button className="mt-3" color="info" size="lg">
            {submit}
          </Button>
        </div>
        <div className="image-container">
          <img className="image-size" src={src_image} />
        </div>
      </Form>
    </div>
  );
};

export default Sign;
