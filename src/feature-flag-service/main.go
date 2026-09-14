package main

import (
	"dynatrace.com/easytrade/feature-flag-service/flag"
	"log"
)

func main() {
	svc := flag.NewService(flag.InitFlags())
	r := CreateRouter(svc)
	setupHealth(r)
	if err := r.Run(":8080"); err != nil {
		log.Fatal(err)
	}
}
