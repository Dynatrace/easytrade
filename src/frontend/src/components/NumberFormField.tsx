import { styled } from "@mui/system"
import { TextFieldElement } from "react-hook-form-mui"

export const NumberFormField = styled(TextFieldElement)({
    "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
        display: "none",
    },
    "& input[type=number]": {
        MozAppearance: "textfield",
    },
})
