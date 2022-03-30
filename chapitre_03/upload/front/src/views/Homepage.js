import React from 'react';
import axios from 'axios';
import {useState, useContext, useEffect} from "react";
import styled from "styled-components"; //Style library
import {UsersContexts} from '../App';
import Form from './Form';
import ListUsers from '../components/ListUsers';

export default function Homepage() {

    const usersContext = useContext(UsersContexts);

    async function fetchData(){
        //Initializing the student's list on mount:
        await axios.get('http://localhost:8000/users')
        .then(res => {
          const usersData = res.data;
          console.log(usersData);
    
          usersContext.setUsersList(usersData);
          console.log("users state: ", usersContext.usersList);
        })
    
      }
    
      useEffect( ()=> {
        fetchData();
    
      }, [])


  return (


    <DivWrapper>
        <Form/>
        <ListUsers/>
        
    </DivWrapper>
  )
}


const DivWrapper = styled.div`
  display: flex;
  justify-content: space-evenly;
  margin-top: 2%;
  background-size: 100%;
  height: 95vh;
  margin-left: -1%;
  background-repeat: no-repeat;
  background-position: center;
  @media(max-width: 900px) {
    flex-direction: column ;
    background-size: cover;
  }
`
