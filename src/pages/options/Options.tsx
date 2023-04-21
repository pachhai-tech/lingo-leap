import logo from "@assets/img/logo.svg";
import "@pages/options/Options.css";
import React from "react";

const Options: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/pages/options/Options.tsx</code> and save to reload.
        </p>
      </header>
    </div>
  );
};

export default Options;
