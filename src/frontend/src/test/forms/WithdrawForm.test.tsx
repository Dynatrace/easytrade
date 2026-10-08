import WithdrawForm from "../../components/forms/WithdrawForm"
import { describeCardForm } from "./cardFormSuite"

describeCardForm({
    title: "Withdraw Form",
    submitLabel: /withdraw/i,
    renderForm: (handler) => <WithdrawForm submitHandler={handler} />,
})
