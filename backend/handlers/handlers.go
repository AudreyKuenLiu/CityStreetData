package handlers

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"strconv"

	dc "citystreetdata/controllers"
	"citystreetdata/utils"

	echo "github.com/labstack/echo/v4"
)

type handlers struct {
	echoInstance     *echo.Echo
	logger           *slog.Logger
	dummyController  *dc.DummyController
	sfDataController *dc.SfDataController
}

type Params struct {
	EchoInstance *echo.Echo
}

func NewHandlers(p Params) (*handlers, error) {
	logger := slog.Default()
	dummyController := dc.NewDummyController()
	sfDataController, err := dc.NewSFDataController(logger)
	if err != nil {
		return nil, err
	}

	h := handlers{
		echoInstance:    p.EchoInstance,
		dummyController: dummyController,
		sfDataController: sfDataController,
		logger: logger,
	}

	return &h, nil
}

func (h *handlers) InitHandlers() error {
	h.echoInstance.GET("/api/ping", h.pingDB)
	h.echoInstance.GET("/api/segments", h.getSegmentsForViewport)
	return nil
}

func (h *handlers) getSegmentsForViewport(c echo.Context) error {
	nePointStr := c.QueryParam("nePoint")
	swPointStr := c.QueryParam("swPoint")
	zoomLevelStr := c.QueryParam("zoomLevel")
	if nePointStr == "" || swPointStr == "" || zoomLevelStr == "" {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("missing required query parameters - nePoint: %v - swPoint: %v - zoomLevel: %v", nePointStr, swPointStr, zoomLevelStr))
	}
	nePoints, err := utils.StringArrayToNumberArray[float64](nePointStr)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("error parsing nePoint: %v, format must be [float, float]", err))
	}
	swPoints, err := utils.StringArrayToNumberArray[float64](swPointStr)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("error parsing swPoint: %v, format must be [float, float]", err))
	}
	zoomLevel, err := strconv.ParseFloat(zoomLevelStr, 64)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("error parsing zoomLevel: %v, format must be float", err))
	}

	result, err := h.sfDataController.GetSegmentsForViewport(c.Request().Context(), &dc.GetSegmentsForViewportParams{
		NEPoint:   [2]float64{nePoints[0], nePoints[1]},
		SWPoint:   [2]float64{swPoints[0], swPoints[1]},
		ZoomLevel: zoomLevel,
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("error getting segments for viewport: %v", err))
	}
	return c.JSON(http.StatusOK, result)
}

func (h *handlers) pingDB(c echo.Context) error {
	rows, err := h.dummyController.PingDB()
	h.logger.Info("returning from pingdb", "rows", rows, "error", err)
	if err != nil {
		return err
	}

	jsonData, err := json.Marshal(rows)
	if err != nil {
		return err
	}
	return c.String(http.StatusOK, string(jsonData))
}
