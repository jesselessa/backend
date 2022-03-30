import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { createContext, useState } from "react";

import Gallery from "./views/Gallery";
import Homepage from "./views/Homepage";

export const UsersContexts = createContext();

export default function App() {
  // a local state to store the currently selected file.
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [usersList, setUsersList] = useState([]);

  const usersContext = {
    image,
    setImage,
    name,
    setName,
    usersList,
    setUsersList,
  };

  return (
    <div>
      <UsersContexts.Provider value={usersContext}>
        <BrowserRouter>
          <Routes>
            <Route exact path="/" component={Homepage}></Route>
            <Route exact path="/success" component={Gallery}></Route>
          </Routes>
        </BrowserRouter>
      </UsersContexts.Provider>
    </div>
  );
}
