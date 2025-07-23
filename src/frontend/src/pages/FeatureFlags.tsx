import React from "react"
import {
    Alert,
    Backdrop,
    Card,
    CircularProgress,
    IconButton,
    Stack,
    Typography,
} from "@mui/material"
import FeatureFlagList from "../components/featureFlags/FeatureFlagList"
import Grid2 from "@mui/material/Grid2"
import {
    useConfigFlagsQuery,
    useProblemFlagsQuery,
} from "../contexts/QueryContext/featureFlag/hooks"
import ReplayIcon from "@mui/icons-material/Replay"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { featureFlagKeys } from "../contexts/QueryContext/featureFlag/queries"
import { delay } from "../api/util"

export default function FeatureFlags() {
    const { data: flags } = useProblemFlagsQuery()
    const { data: config } = useConfigFlagsQuery()
    const queryClient = useQueryClient()
    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            await Promise.all([
                delay(500),
                queryClient.refetchQueries({ queryKey: featureFlagKeys.all }),
            ])
        },
    })

    return (
        <>
            <Grid2 container>
                <Grid2 size={{ sm: 10 }} offset={{ sm: 1 }}>
                    <Stack direction="column" spacing={2}>
                        <Card sx={{ padding: 2 }}>
                            <Typography>
                                Feature flags (or problem patterns) are used to
                                enable or disable specific problem simulation in
                                EasyTrade application. Each feature flag
                                (problem pattern) comes with its own description
                                of what parts of the application are affected
                                and what symptoms should be expected.
                            </Typography>
                        </Card>
                        <Stack
                            sx={{ width: "100%" }}
                            direction="row"
                            justifyContent={"right"}
                        >
                            <Stack
                                sx={{ width: "100%" }}
                                direction="row"
                                justifyContent={"left"}
                            >
                                {!config?.featureFlagManagement && (
                                    <Alert severity="info">
                                        The feature flag modification via UI has
                                        been disabled.
                                    </Alert>
                                )}
                            </Stack>
                            <IconButton onClick={() => mutate()}>
                                <ReplayIcon />
                            </IconButton>
                        </Stack>
                        <FeatureFlagList featureFlags={flags ?? []} />
                    </Stack>
                </Grid2>
            </Grid2>
            <Backdrop
                open={isPending}
                sx={{
                    color: "#fff",
                }}
            >
                <CircularProgress />
            </Backdrop>
        </>
    )
}
