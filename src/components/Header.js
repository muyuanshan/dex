import React from "react";
import Logo from "../moralis-logo.svg";
import Eth from "../eth.svg";
import { Link } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import AddLiquidity from "./AddLiquidity";

function Header(props) {

  return (
    <header>
      <div className="leftH">
        <img src={Logo} alt="logo" className="logo" />
        <Link to="/" className="link">
          <div className="headerItem">Swap</div>
        </Link>
        <Link to="/faucet" className="link">
          <div className="headerItem">Faucet</div>
        </Link>
      </div>
      <div className="rightH">
        <div className="headerItem">
          <img src={Eth} alt="eth" className="eth" />
          Ethereum
        </div>
        {/* 如果需要添加池子 把注释解开  我用的我自己的代币地址 如果要增加其他的记的换 */}
        {/* <AddLiquidity /> */}
        <ConnectButton></ConnectButton>
      </div>
    </header>
  );
}

export default Header;
