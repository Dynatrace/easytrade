package offer

import "encoding/xml"

type Offer struct {
	Platform string         `xml:"platform"`
	QuoteFor string         `xml:"quoteFor"`
	Packages []offerPackage `xml:"packages"`
	Products []offerProduct `xml:"products"`
}

type offerPackage struct {
	Id      int     `xml:"id"`
	Name    string  `xml:"name"`
	Price   float32 `xml:"price"`
	Support string  `xml:"support"`
}

type offerProduct struct {
	Id       int     `xml:"id"`
	Name     string  `xml:"name"`
	Ppt      float32 `xml:"ppt"`
	Currency string  `xml:"currency"`
}

type OfferXml struct {
	Offer
	XmlName xml.Name `xml:"offer"`
}
