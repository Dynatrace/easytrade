import { XpathSelector } from "@demoability/loadgen-core"

export const selectors = {
    common_currentBalance: new XpathSelector(
        "current-balance",
        '//input[@id="currentBalance"]'
    ),
    loginPage_username: new XpathSelector(
        "username-input",
        '//input[@id="login"]'
    ),
    loginPage_password: new XpathSelector(
        "password-input",
        '//input[@id="password"]'
    ),
    loginPage_loginButton: new XpathSelector(
        "login-button",
        '//button[@id="submitButton"]'
    ),

    navigation_depositPage: new XpathSelector(
        "deposit-page-nav",
        '//a[@id="nav-deposit"]'
    ),
    navigation_homePage: new XpathSelector(
        "home-page-nav",
        '//a[@id="nav-home"]'
    ),
    navigation_withdrawPage: new XpathSelector(
        "withdraw-page-nav",
        '//a[@id="nav-withdraw"]'
    ),
    navigation_instrumentsPage: new XpathSelector(
        "instruments-page-nav",
        '//a[@id="nav-instruments"]'
    ),
    navigation_dropdownToggler: new XpathSelector(
        "dropdown-toggler",
        '//button[@id="profileToggler"]'
    ),
    navigation_creditCardPage: new XpathSelector(
        "credit-card-page-nav",
        '//a[@id="nav-credit-card"]'
    ),
    navigation_logout: new XpathSelector(
        "logout-button",
        '//li[@id="logoutItem"]'
    ),
    depositPage_submit: new XpathSelector(
        "deposit-button",
        '//button[@id="submitButton"]'
    ),
    depositPage_cardholderName: new XpathSelector(
        "name-input",
        '//input[@id="cardholderName"]'
    ),
    depositPage_cardType: new XpathSelector(
        "credit-card-select",
        '//select[@id="cardType"]'
    ),
    depositPage_address: new XpathSelector(
        "address-input",
        '//input[@id="address"]'
    ),
    depositPage_email: new XpathSelector("email-input", '//input[@id="email"]'),
    depositPage_cardNumber: new XpathSelector(
        "card-number-input",
        '//input[@id="cardNumber"]'
    ),
    depositPage_cardCvv: new XpathSelector(
        "card-cvv-input",
        '//input[@id="cvv"]'
    ),
    depositPage_amount: new XpathSelector(
        "deposit-amount-input",
        '//input[@id="amount"]'
    ),
    depositPage_acceptTerms: new XpathSelector(
        "accept-terms-check",
        '//input[@id="agreement"]'
    ),
    instrumentsPage_instrumentCard: new XpathSelector(
        "instrument-card",
        '//div[contains(@class, "instrument-card")]/a[contains(@href, "instruments")]'
    ),
    instrumentsPage_ownedInstrument: new XpathSelector(
        "owned-instrument-card",
        '//div[contains(@class, "owned-instrument")]/a[contains(@href, "instruments")]'
    ),
    instrumentPage_quickBuyForm: new XpathSelector(
        "quick-buy-nav",
        '//button[@id="quickBuyTab"]'
    ),
    instrumentPage_quickSellForm: new XpathSelector(
        "quick-sell-nav",
        '//button[@id="quickSellTab"]'
    ),
    instrumentPage_buyForm: new XpathSelector(
        "long-buy-nav",
        '//button[@id="buyTab"]'
    ),
    instrumentPage_sellForm: new XpathSelector(
        "long-sell-nav",
        '//button[@id="sellTab"]'
    ),
    instrumentPage_instrumentPrice: new XpathSelector(
        "instrument-price-view",
        '//h5[@id="instrumentPrice"]'
    ),
    instrumentPage_instrumentName: new XpathSelector(
        "instrument-name-view",
        '//*[@id="instrumentName"]'
    ),
    instrumentPage_amountInput: new XpathSelector(
        "amount-input",
        '//input[@id="amount"]'
    ),
    instrumentPage_possessedAmount: new XpathSelector(
        "owned-amount-view",
        '//input[@id="possessedAmount"]'
    ),
    instrumentPage_priceInput: new XpathSelector(
        "price-input",
        '//input[@id="price"]'
    ),
    instrumentPage_timeInput: new XpathSelector(
        "duration-input",
        '//input[@id="time"]'
    ),
    instrumentPage_submitButton: new XpathSelector(
        "submit-transaction-button",
        '//button[@id="submitButton"]'
    ),
    creditCardPage_nameInput: new XpathSelector(
        "name-input",
        '//input[@id="name"]'
    ),
    creditCardPage_addressInput: new XpathSelector(
        "address-input",
        '//input[@id="address"]'
    ),
    creditCardPage_emailInput: new XpathSelector(
        "email",
        '//input[@id="email"]'
    ),
    creditCardPage_cardTypeInput: new XpathSelector(
        "card-type-select",
        '//select[@id="type"]'
    ),
    creditCardPage_orderCardButton: new XpathSelector(
        "order-card-button",
        '//button[@id="submitButton"]'
    ),
    creditCardPage_acceptTerms: new XpathSelector(
        "accept-terms-check",
        '//input[@id="agreement"]'
    ),
    creditCardPage_revokeCard: new XpathSelector(
        "revoke-card-button",
        '//button[@id="revoke-card"]'
    ),
    creditCardPage_orderIdDisplay: new XpathSelector(
        "order-id-view",
        '//p[@id="order-id"]'
    ),
}
