import React from "react"
import {
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    useTheme,
} from "@mui/material"
import Drawer from "@mui/material/Drawer"
import HomeIcon from "@mui/icons-material/Home"
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet"
import CreditCardIcon from "@mui/icons-material/CreditCard"
import { NavLink } from "react-router"
import { ReactElement } from "react"
import { Euro } from "@mui/icons-material"
import { useNavigation } from "../contexts/NavigationContext/context"
import AddCardIcon from "@mui/icons-material/AddCard"

interface NavigationItemProps {
    path: string
    icon: ReactElement
    text: string
}

function NavigationItem({ path, icon, text }: NavigationItemProps) {
    const theme = useTheme()
    return (
        <ListItem>
            <ListItemButton
                component={NavLink}
                to={path}
                sx={{
                    "&.active": {
                        backgroundColor: theme.palette.action.selected,
                    },
                }}
            >
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={text} />
            </ListItemButton>
        </ListItem>
    )
}

export default function Navigation() {
    const { navigationVisible } = useNavigation()
    return (
        <Drawer variant="persistent" open={navigationVisible}>
            <Toolbar />
            <Box>
                <List>
                    <NavigationItem
                        path={"/home"}
                        icon={<HomeIcon />}
                        text={"Home"}
                    />
                    <NavigationItem
                        path={"/instruments"}
                        icon={<Euro />}
                        text={"Instruments"}
                    />
                    <NavigationItem
                        path={"/deposit"}
                        icon={<CreditCardIcon />}
                        text={"Deposit"}
                    />
                    <NavigationItem
                        path={"/withdraw"}
                        icon={<AccountBalanceWalletIcon />}
                        text={"Withdraw"}
                    />
                    <NavigationItem
                        path={"/credit-card"}
                        icon={<AddCardIcon />}
                        text={"Credit Card"}
                    />
                </List>
            </Box>
        </Drawer>
    )
}
