import React from "react"
import {
    Button,
    Dialog,
    DialogActions,
    DialogTitle,
    List,
    ListItem,
    ListItemText,
} from "@mui/material"
import { Link as RouterLink } from "react-router"
import { ServiceVersionData } from "../../api/version/types"

interface VersionDialogProps {
    open: boolean
    closeHandler: () => void
    serviceVersion: ServiceVersionData
}

export function VersionDialog(props: VersionDialogProps) {
    return (
        <Dialog open={props.open} onClose={props.closeHandler}>
            <DialogTitle>EasyTrade</DialogTitle>
            <List
                sx={{
                    paddingX: "30px",
                }}
            >
                <ListItem>
                    <ListItemText
                        primary="Version"
                        secondary={props.serviceVersion.buildVersion}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary="Build date"
                        secondary={props.serviceVersion.buildDate}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary="Build commit"
                        secondary={props.serviceVersion.buildCommit}
                    />
                </ListItem>
            </List>
            <DialogActions sx={{ justifyContent: "space-around" }}>
                <Button
                    variant="outlined"
                    onClick={props.closeHandler}
                    to="/version"
                    component={RouterLink}
                >
                    More
                </Button>
                <Button variant="outlined" onClick={props.closeHandler}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    )
}
