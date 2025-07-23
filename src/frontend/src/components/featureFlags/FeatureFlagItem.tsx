import React from "react"
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Chip,
    Paper,
    Stack,
    Tooltip,
    Typography,
    IconButton,
    Box,
    Button,
} from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import Grid2 from "@mui/material/Grid2"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { featureFlagKeys } from "../../contexts/QueryContext/featureFlag/queries"
import { handleFlagToggle } from "../../api/featureFlags/problemPatterns"
import { Dispatch } from "react"
import { Action } from "./FeatureFlagList"
import { useConfigFlagsQuery } from "../../contexts/QueryContext/featureFlag/hooks"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"

function getFeatureFlagCurl(flagId: string, enable: boolean): string {
    return `curl -X PUT "${window.location.origin}/feature-flag-service/v1/flags/${flagId}" -H "Content-Type: application/json" -d '{"enabled": ${enable}}'`
}

export default function FeatureFlagItem({
    flagId,
    name,
    description,
    enabled,
    expanded,
    isModifiable,
    dispatchHandler,
}: {
    flagId: string
    name: string
    description?: string
    enabled: boolean
    expanded: boolean
    isModifiable: boolean
    dispatchHandler: Dispatch<Action>
}) {
    const queryClient = useQueryClient()
    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            const { error } = await handleFlagToggle(flagId, !enabled)
            if (error !== undefined) {
                throw error
            }
        },
        onMutate: () => {
            return { enabled: !enabled }
        },
        onSuccess: async (_data, _vars, context) => {
            await queryClient.invalidateQueries({
                queryKey: featureFlagKeys.problemPatterns,
                exact: true,
            })
            dispatchHandler({
                type: "success",
                msg: `Flag ${name} ${
                    context?.enabled ? "enabled" : "disabled"
                } successfully.`,
            })
        },
        onError: (error: string, _vars, context) => {
            console.error(error)
            dispatchHandler({
                type: "error",
                msg: `Error while ${
                    context?.enabled ? "enabling" : "disabling"
                } flag ${name}: ${error}.`,
            })
        },
    })

    const { data: config } = useConfigFlagsQuery()
    const displayName = name
        .split("_")
        .map(([head, ...tail]) => `${head.toUpperCase()}${tail.join("")}`)
        .join(" ")
    const curlCommand = getFeatureFlagCurl(flagId, !enabled)
    const modifyDisabled = !isModifiable || !config?.featureFlagManagement

    return (
        <Accordion
            expanded={expanded}
            onChange={() => dispatchHandler({ type: "expand", target: name })}
        >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack
                    sx={{ width: "100%", mr: 2 }}
                    direction={"row"}
                    alignContent={"center"}
                    alignItems={"center"}
                    justifyContent={"space-between"}
                >
                    <Typography variant="h5">{displayName}</Typography>
                    <Stack
                        sx={{ mr: 2 }}
                        direction={"row"}
                        alignContent={"center"}
                        alignItems={"center"}
                        justifyContent={"right"}
                        spacing={2}
                    >
                        <Chip
                            label={
                                isModifiable ? "modifiable" : "non-modifiable"
                            }
                            color={isModifiable ? "info" : "warning"}
                            variant="outlined"
                        />
                        <Chip
                            label={enabled ? "enabled" : "disabled"}
                            color={enabled ? "success" : "error"}
                            variant="outlined"
                        />
                    </Stack>
                </Stack>
            </AccordionSummary>
            <AccordionDetails>
                <Grid2 container spacing={2}>
                    <Grid2 size={{ xs: 10 }}>
                        <Typography>
                            <Typography
                                color="primary"
                                component={"span"}
                                style={{ display: "inline-block" }}
                            >
                                Flag id:
                            </Typography>{" "}
                            {flagId}
                        </Typography>
                        <Typography>
                            <Typography
                                color="primary"
                                component={"span"}
                                style={{ display: "inline-block" }}
                            >
                                Description:
                            </Typography>{" "}
                            {description ??
                                "There is no description for this flag currently."}
                        </Typography>
                        <Typography
                            color="primary"
                            style={{ display: "inline-block" }}
                        >
                            CURL to {enabled ? "disable" : "enable"} the feature
                            flag:
                        </Typography>
                        <Paper
                            square={false}
                            elevation={16}
                            style={{ width: "fit-content" }}
                        >
                            <Stack
                                direction="row"
                                px={2}
                                alignItems={"center"}
                                justifyContent={"center"}
                            >
                                <Typography variant="body1" p={2}>
                                    {curlCommand}
                                </Typography>
                                <Box>
                                    <IconButton
                                        onClick={() => {
                                            void navigator.clipboard.writeText(
                                                curlCommand
                                            )
                                            dispatchHandler({
                                                type: "success",
                                                msg: "Copied to clipboard!",
                                            })
                                        }}
                                    >
                                        <ContentCopyIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid2>
                    <Grid2
                        size={{ xs: 2 }}
                        justifyContent={"right"}
                        display={"flex"}
                        alignContent={"flex-start"}
                        alignItems={"flex-start"}
                    >
                        <Tooltip
                            title="Managing flags on frontend has been disabled in this environment"
                            disableHoverListener={modifyDisabled}
                        >
                            <span>
                                <Button
                                    onClick={() => mutate()}
                                    loading={isPending}
                                    variant="outlined"
                                    color={enabled ? "error" : "success"}
                                    disabled={modifyDisabled}
                                    data-dt-mouse-over="300"
                                >
                                    {enabled ? "Disable" : "Enable"}
                                </Button>
                            </span>
                        </Tooltip>
                    </Grid2>
                </Grid2>
            </AccordionDetails>
        </Accordion>
    )
}
