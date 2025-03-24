import React from "react"
import { Badge, IconButton } from "@mui/material"
import FlagIcon from "@mui/icons-material/Flag"
import { Link as RouterLink } from "react-router"
import { useProblemFlagsQuery } from "../../contexts/QueryContext/featureFlag/hooks"

export default function FeatureFlag() {
    const { data: flags } = useProblemFlagsQuery()
    const enabledFlagCount =
        flags?.filter(({ enabled }) => enabled)?.length ?? 0
    return (
        <IconButton
            to="/feature-flags"
            component={RouterLink}
            sx={{
                color: "inherit",
            }}
        >
            <Badge badgeContent={enabledFlagCount} color="secondary">
                <FlagIcon />
            </Badge>
        </IconButton>
    )
}
