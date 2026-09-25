package main

import (
	"log"

	"dynatrace.com/easytrade/feature-flag-service/flag"
)

func main() {
	svc := flag.NewService(flag.InitFlags())
	r := CreateRouter(svc)
	setupHealth(r)
	if err := r.Run(":8080"); err != nil {
		log.Fatal(err)
	}
}
