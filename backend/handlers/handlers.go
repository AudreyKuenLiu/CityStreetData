package handlers

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"time"

	dc "citystreetdata/controllers"
	cTypes "citystreetdata/controllers/types"
	"citystreetdata/types"

	"github.com/go-playground/validator/v10"

	echo "github.com/labstack/echo/v4"
)

type handlers struct {
	echoInstance     *echo.Echo
	logger           *slog.Logger
	dummyController  *dc.DummyController
	sfDataController *dc.SfDataController
	validate         *validator.Validate
}

type Params struct {
	EchoInstance *echo.Echo
}

func NewHandlers(p Params) (*handlers, error) {
	logger := slog.Default()
	dummyController := dc.NewDummyController()
	sfDataController, err := dc.NewSFDataController(logger)
	validate := validator.New()
	if err != nil {
		return nil, err
	}

	h := handlers{
		echoInstance:     p.EchoInstance,
		dummyController:  dummyController,
		sfDataController: sfDataController,
		validate:         validate,
		logger:           logger,
	}

	return &h, nil
}

func (h *handlers) InitHandlers() error {
	h.echoInstance.GET("/api/ping", h.pingDB)
	h.echoInstance.GET("/api/segmentsForViewport", h.getSegmentsForViewport)
	h.echoInstance.GET("/api/segmentsForGrid", h.getSegmentsForGrid)
	h.echoInstance.GET("/api/crashesForCnns", h.getCrashesForCnns)
	return nil
}

func (h *handlers) getCrashesForCnns(c echo.Context) error {
	cnnsStr := c.QueryParam("cnns")
	startTimeStr := c.QueryParam("startTime")
	endTimeStr := c.QueryParam("endTime")

	cnns := []int{}
	if len(cnnsStr) > 0 {
		err := json.Unmarshal([]byte(cnnsStr), &cnns)
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("error parsing cnns: %v", err))
		}
	}
	startTime, err := time.Parse(time.RFC3339, startTimeStr)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("error parsing startTime: %v", err))
	}
	endTime, err := time.Parse(time.RFC3339, endTimeStr)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("error parsing endTime: %v", err))
	}

	result, err := h.sfDataController.GetCrashesForStreets(c.Request().Context(), &cTypes.GetCrashesForStreetsParams{
		CNNs:      cnns,
		StartTime: startTime,
		EndTime:   endTime,
	})

	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("error getting traffic crashes for cnns: %v", err))
	}

	return c.JSON(http.StatusOK, result)
}

func (h *handlers) getSegmentsForViewport(c echo.Context) error {
	nePointStr := c.QueryParam("nePoint")
	swPointStr := c.QueryParam("swPoint")
	filterStr := c.QueryParam("filters")
	if nePointStr == "" || swPointStr == "" {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("missing required query parameters - nePoint: %v - swPoint: %v", nePointStr, swPointStr))
	}
	nePoints := [2]float64{0, 0}
	err := json.Unmarshal([]byte(nePointStr), &nePoints)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("error parsing nePoint: %v, format must be [float, float]", err))
	}
	swPoints := [2]float64{0, 0}
	err = json.Unmarshal([]byte(swPointStr), &swPoints)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("error parsing swPoint: %v, format must be [float, float]", err))
	}
	var filters types.StreetFeatureFilters
	if len(filterStr) > 0 {
		err = json.Unmarshal([]byte(filterStr), &filters)
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("error parsing filters: %v", err))
		}
	}

	result, err := h.sfDataController.GetSegmentsForViewport(c.Request().Context(), &cTypes.GetSegmentsForViewportParams{
		Rectangle: cTypes.RectangleCell{
			NEPoint: nePoints,
			SWPoint: swPoints,
		},
		Filters: &filters,
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("error getting segments for viewport: %v", err))
	}
	return c.JSON(http.StatusOK, result)
}

func (h *handlers) getSegmentsForGrid(c echo.Context) error {
	cityGrid := c.QueryParam("cityGrid")
	filterStr := c.QueryParam("filters")

	cityGridObj := [][]cTypes.RectangleCell{}
	err := json.Unmarshal([]byte(cityGrid), &cityGridObj)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("error parsing cityGrid: %v", err))
	}
	var filters types.StreetFeatureFilters
	if len(filterStr) > 0 {
		err = json.Unmarshal([]byte(filterStr), &filters)
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("error parsing filters: %v", err))
		}
	}

	result, err := h.sfDataController.GetSegmentsForGrid(c.Request().Context(), &cTypes.GetSegmentsForGridParams{
		Grid:    &cityGridObj,
		Filters: &filters,
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("error getting segments for CityGrid: %v", err))
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
