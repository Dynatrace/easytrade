package thirdparty

import (
	"encoding/json"
	"time"
)

type ManufactureStatus int

const (
	Issuing ManufactureStatus = iota
	ManufactureError
	CardCreated
)

type CourierStatus int

const (
	NewCardReceived CourierStatus = iota
	CardSent
	CardDelivered
)

type OrderStatus string

const (
	OrderCreated       OrderStatus = "ORDER_CREATED"
	OrderCardOrdered   OrderStatus = "CARD_ORDERED"
	OrderCardCreated   OrderStatus = "CARD_CREATED"
	OrderCardError     OrderStatus = "CARD_ERROR"
	OrderCardShipped   OrderStatus = "CARD_SHIPPED"
	OrderCardDelivered OrderStatus = "CARD_DELIVERED"
	OrderSequenceError OrderStatus = "SEQUENCE_ERROR"
)

type CreditCardRequest struct {
	CreditCardOrderID string `json:"creditCardOrderId"`
	Name              string `json:"name"`
	CardLevel         string `json:"cardLevel"`
}

type CreditCardBody struct {
	CardLevel     string    `json:"cardLevel"`
	CardNumber    string    `json:"cardNumber"`
	CardCVS       string    `json:"cardCVS"`
	CardValidDate time.Time `json:"cardValidDate"`
}

type ErrorBody struct {
	ErrorCode    int    `json:"errorCode"`
	ErrorType    string `json:"errorType"`
	ErrorMessage string `json:"errorMessage"`
}

var (
	FactoryFailure = ErrorBody{ErrorCode: 22, ErrorType: "delay", ErrorMessage: "Factory failure"}
	DelayOnChips   = ErrorBody{ErrorCode: 35, ErrorType: "delay", ErrorMessage: "Delay on chips"}
)

type ShippingIDBody struct {
	ShippingID string `json:"shippingId"`
}

type ShippingAddress struct {
	ShippingAddress string `json:"shippingAddress"`
	Name            string `json:"name"`
	Email           string `json:"email"`
}

// StatusCode field — not the HTTP response status — is what callers must
// check; see serviceclient.go.
type StandardResponse struct {
	StatusCode *int            `json:"statusCode"`
	Message    string          `json:"message"`
	Results    json.RawMessage `json:"results,omitempty"`
	Data       json.RawMessage `json:"data,omitempty"`
	Error      json.RawMessage `json:"error,omitempty"`
}

type StatusRequest struct {
	OrderID   string    `json:"orderId"`
	Type      string    `json:"type"`
	Timestamp time.Time `json:"timestamp"`
	Details   any       `json:"details,omitempty"`
}

type ManufactureProcess struct {
	Request     CreditCardRequest
	Status      ManufactureStatus
	CardDetails *CreditCardBody
}

type CourierProcess struct {
	CreditCardOrderID string
	Status            CourierStatus
	Address           *ShippingAddress
	ShippingID        string
}
