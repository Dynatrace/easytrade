import { screen } from "@testing-library/react"
import DepositForm from "../../components/forms/DepositForm"
import { describeCardForm } from "./cardFormSuite"

describeCardForm({
    title: "Deposit Form",
    submitLabel: /deposit/i,
    renderForm: (handler) => <DepositForm submitHandler={handler} />,
    fillExtraFields: async (user) => {
        await user.type(screen.getByLabelText(/cvv/i), "111")
    },
    expectedExtraPayload: { cvv: "111" },
})
