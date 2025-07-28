package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	dc "citystreetdata/controllers"

	echo "github.com/labstack/echo/v4"
)

type handlers struct {
	echoInstance    *echo.Echo
	dummyController *dc.DummyController
}

type Params struct {
	EchoInstance *echo.Echo
}

func NewHandlers(p Params) *handlers {
	dummyController := dc.NewDummyController()

	h := handlers{
		echoInstance:    p.EchoInstance,
		dummyController: dummyController,
	}

	return &h
}

func (h *handlers) InitHandlers() error {
	h.echoInstance.GET("/ping", h.pingDB)
	return nil
}

func (h *handlers) pingDB(c echo.Context) error {
	rows, err := h.dummyController.PingDB()
	fmt.Printf("returning from pingdb: %v | %v\n", rows, err)
	if err != nil {
		return err
	}

	jsonData, err := json.Marshal(rows)
	if err != nil {
		return err
	}
	return c.String(http.StatusOK, string(jsonData))
}
