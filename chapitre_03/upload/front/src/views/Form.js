import React from "react";
import { useContext } from "react";
import axios from "axios";
// Styles
import styled from "styled-components";
// Context
import { UsersContexts } from "../App";

export default function Form() {
  const usersContext = useContext(UsersContexts);

  const handleFileSelect = (e) => {
    usersContext.setImage(e.target.files[0]);
    console.log(e.target.files[0]);
  };

  const handleNameField = (e) => {
    usersContext.setName(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const bodyFormData = new FormData();
    bodyFormData.append("name", usersContext.name);
    bodyFormData.append("image", usersContext.image);

    await axios({
      method: "post",
      url: "http://localhost:8000/user",
      data: bodyFormData,
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then((res) => {
        //handle success
        console.log(res);
      })
      .catch((res) => {
        //handle error
        console.log(res);
      });

    //Updating the usersList state :
    await axios.get("http://localhost:8000/users").then((res) => {
      const usersData = res.data;
      console.log(usersData);

      usersContext.setUsersList(usersData);
      console.log("users state: ", usersContext.usersList);
    });

    //Resetting the input's field:
    document.querySelector(".user-input").value = "";

    console.log("updated");
  };

  return (
    <DivWrapper>
      <h1>FORM</h1>
      <form action="" method="post" onSubmit={handleSubmit}>
        <input
          type="text"
          name=""
          id=""
          placeholder="Your name here"
          className="user-input"
          onChange={handleNameField}
        />
        <label htmlFor="photo"> Add a profile picture : </label>
        <input type="file" name="photo" id="" onChange={handleFileSelect} />
        <input type="button" value="SUBMIT" onClick={handleSubmit} />
      </form>
    </DivWrapper>
  );
}

//----------------------- STYLED COMPONENTS -----------------------

const DivWrapper = styled.div`
  form {
    background-color: white;
    padding: 15% 3% 3% 3%;
    width: 105%;
    height: 50vh;
    background-color: white;
    border-radius: 8px;
    margin-top: 15%;
    border-radius: 16px;
    -webkit-box-shadow: 2px 8px 17px -1px rgba(0, 0, 0, 0.76);
    box-shadow: 2px 8px 17px -1px rgba(0, 0, 0, 0.76);
  }
  h1 {
    text-align: center;
    font-size: 2.5em;
    color: white;
    width: 100%;
    border-radius: 5px;
  }
  /* LABEL */
  label {
    text-align: center;
    color: black;
    font-weight: bold;
    font-size: 1.8em;
    display: block;
    margin: 15% 0 8% 0;
    width: 100%;
  }
  /* INPUT TEXT */
  .user-input {
    padding: 8px;
    font-size: 17px;
    border: 1px solid #cccccc;
    opacity: 0.9;
    color: #000000;
    border-style: solid;
    width: 90%;
    height: 1.5em;
    border-radius: 4px;
    box-shadow: 0px 0px 5px rgba(66, 66, 66, 0.75);
    text-shadow: -50px 0px 0px rgba(66, 66, 66, 0);
  }
  .user-input:focus {
    outline: none;
  }
  /* SUBMIT BUTTON */
  input[type="button"] {
    background-color: white;
    width: 60%;
    color: black;
    font-weight: bold;
    font-size: 1.3em;
    border-radius: 7px;
    margin: 6% 20%;
    padding: 3%;
    /* border: 1px solid orange; */
  }
  /* BACKGROUND SETTINGS */

  @media (max-width: 900px) {
    width: 40%;
    margin: auto;
    margin-top: 4%;

    form {
      width: 90%;
      padding: 2%;
      margin-top: 2%;
    }
    label {
      margin: 10% 0 8% 0;
    }
  }
`;
