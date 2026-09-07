import React from "react"
import { NavLink } from "react-router"
import {
    HomeIcon,
    InstrumentsIcon,
    DepositIcon,
    WithdrawIcon,
    AddCardIcon,
} from "./icons"

export default function Navigation() {
    return (
        <nav className="sidebar">
            <div className="sidebar-nav">
                <ul>
                    <li>
                        <NavLink
                            id="nav-home"
                            to="/home"
                            className={({ isActive }) =>
                                "nav-link" + (isActive ? " active" : "")
                            }
                        >
                            <HomeIcon />
                            Home
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            id="nav-instruments"
                            to="/instruments"
                            className={({ isActive }) =>
                                "nav-link" + (isActive ? " active" : "")
                            }
                        >
                            <InstrumentsIcon />
                            Instruments
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            id="nav-deposit"
                            to="/deposit"
                            className={({ isActive }) =>
                                "nav-link" + (isActive ? " active" : "")
                            }
                        >
                            <DepositIcon />
                            Deposit
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            id="nav-withdraw"
                            to="/withdraw"
                            className={({ isActive }) =>
                                "nav-link" + (isActive ? " active" : "")
                            }
                        >
                            <WithdrawIcon />
                            Withdraw
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            id="nav-credit-card"
                            to="/credit-card"
                            className={({ isActive }) =>
                                "nav-link" + (isActive ? " active" : "")
                            }
                        >
                            <AddCardIcon />
                            Credit Card
                        </NavLink>
                    </li>
                </ul>
            </div>
        </nav>
    )
}
