import { FlagResponseContainer } from "../backend/problemPatterns"

export const FEATURE_FLAGS: FlagResponseContainer = {
    results: [
        {
            id: "1",
            name: "ergo_aggregator_slowdown",
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.",
            enabled: false,
            isModifiable: true,
            tag: "problem_pattern",
        },
        {
            id: "2",
            name: "db_not_responding",
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.",
            enabled: false,
            isModifiable: true,
            tag: "problem_pattern",
        },
        {
            id: "3",
            name: "frontend_feature_flag_management",
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.",
            enabled: false,
            isModifiable: true,
            tag: "config",
        },
    ],
}
