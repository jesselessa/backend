import React from "react";
// import axios from "axios";
// import { post } from "axios";
import { useContext } from "react";
import styled from "styled-components"; //Style library
import { UsersContexts } from "../App";

export default function ListUsers() {
  const usersContext = useContext(UsersContexts);

  return (
    <DivWrapper>
      <h1>USERS LIST : </h1>

      {usersContext.usersList.map((user) => (
        <Names key={user} className="names">
          {user}
        </Names>
      ))}
    </DivWrapper>
  );
}

//----------------------- STYLED COMPONENTS -----------------------
const DivWrapper = styled.div`
  h1 {
    text-align: center;
    font-size: 2.5em;
    color: black;
  }

  border: 1px solid black;
  padding: 2% 4%;
  border-radius: 16px;
  -webkit-box-shadow: 2px 8px 17px -1px rgba(0, 0, 0, 0.76);
  box-shadow: 2px 8px 17px -1px rgba(0, 0, 0, 0.76);
  height: 49vh;
  margin-top: 6%;
  overflow: scroll;

  .names:hover {
    background-color: grey;
  }

  @media (max-width: 900px) {
    width: 40%;
    margin: auto;
  }
`;
const Names = styled.div`
  border: 1px solid grey;
  width: 95%;
  height: 1em;
  margin-bottom: 1%;
  text-align: center;
  padding: 5%;
  background-color: white;
  color: black;
  font-weight: bold;
  font-size: 1.3em;
  border-radius: 5px;
`;
