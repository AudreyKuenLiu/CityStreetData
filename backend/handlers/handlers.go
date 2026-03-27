package handlers

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"strconv"
	"time"

	dc "citystreetdata/controllers"
	cTypes "citystreetdata/controllers/types"
	rTypes "citystreetdata/repositories/types"
	"citystreetdata/types"

	"github.com/go-playground/validator/v10"

	echo "github.com/labstack/echo/v4"
)

type handlers struct {
	echoInstance     *echo.Echo
	logger           *slog.Logger
	sfDataController *dc.SfDataController
	validate         *validator.Validate
}

type Params struct {
	EchoInstance *echo.Echo
}

func NewHandlers(p Params) (*handlers, error) {
	logger := slog.Default()
	sfDataController, err := dc.NewSFDataController(logger)
	validate := validator.New()
	if err != nil {
		return nil, err
	}

	h := handlers{
		echoInstance:     p.EchoInstance,
		sfDataController: sfDataController,
		validate:         validate,
		logger:           logger,
	}

	return &h, nil
}

func (h *handlers) InitHandlers() error {
	h.echoInstance.GET("/api/viewport/streets", h.getSegmentsForViewport)
	h.echoInstance.GET("/api/streets/crashevents", h.getCrashEventsForStreets)
	h.echoInstance.GET("/api/streets/crashevents/all", h.getAllCrashEventsForStreets)
	h.echoInstance.GET("/api/streets/crashdata", h.getCrashDataForStreets)
	h.echoInstance.GET("/api/streets/features", h.getStreetFeatures)
	return nil
}

func parseCnns(c echo.Context) ([]int, error) {
	cnnsStr := c.QueryParam("cnns")
	cnns := []int{}
	if len(cnnsStr) > 0 {
		err := json.Unmarshal([]byte(cnnsStr), &cnns)
		if err != nil {
			return nil, echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("error parsing cnns: %v", err))
		}
	}
	return cnns, nil
}

func parseTime(c echo.Context, timeParam string) (*time.Time, error) {
	startTimeStr := c.QueryParam(timeParam)

	startTimeEpoch, err := strconv.ParseInt(startTimeStr, 10, 64)
	startTime := time.Unix(startTimeEpoch, 0)
	if err != nil {
		return nil, echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("error parsing %s: %v", timeParam, err))
	}
	return &startTime, nil
}

func parseTimeSegment(c echo.Context) (*cTypes.TimeSegmentSize, error) {
	timeSegment := c.QueryParam("timeSegment")

	segmentSize, err := cTypes.StrToSegment(timeSegment)
	if err != nil {
		return nil, echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("error parsing timeSegment: %v", err))
	}
	return &segmentSize, nil
}

func parseFeatureType(c echo.Context) (*rTypes.FeatureType, error) {
	featureTypesStr := c.QueryParam("featureType")
	var featureType rTypes.FeatureType
	if len(featureTypesStr) > 0 {
		err := json.Unmarshal([]byte(featureTypesStr), &featureType)
		if err != nil {
			return nil, echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("error parsing featureType: %v", err))
		}
	}
	if !featureType.IsValid() {
		return nil, echo.NewHTTPError(http.StatusBadRequest, "invalid feature type")
	}
	return &featureType, nil
}

func (h *handlers) getCrashDataForStreets(c echo.Context) error {
	cnns, err := parseCnns(c)
	if err != nil {
		return err
	}
	startTime, err := parseTime(c, "startTime")
	if err != nil {
		return err
	}
	endTime, err := parseTime(c, "endTime")
	if err != nil {
		return err
	}
	segmentSize, err := parseTimeSegment(c)
	if err != nil {
		return err
	}

	result, err := h.sfDataController.GetCrashDataForStreets(c.Request().Context(), &cTypes.GetCrashDataForStreetsParams{
		CNNs:        cnns,
		SegmentSize: *segmentSize,
		StartTime:   *startTime,
		EndTime:     *endTime,
	})

	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("error getting traffic crashes for cnns: %v", err))
	}

	return c.JSON(http.StatusOK, result)
}

func (h *handlers) getAllCrashEventsForStreets(c echo.Context) error {
	result := h.sfDataController.AllCrashEvents(c.Request().Context())

	return c.JSON(http.StatusOK, result)
}

func (h *handlers) getCrashEventsForStreets(c echo.Context) error {
	cnns, err := parseCnns(c)
	if err != nil {
		return err
	}
	startTime, err := parseTime(c, "startTime")
	if err != nil {
		return err
	}
	endTime, err := parseTime(c, "endTime")
	if err != nil {
		return err
	}
	segmentSize, err := parseTimeSegment(c)
	if err != nil {
		return err
	}

	result, err := h.sfDataController.GetCrashesForStreets(c.Request().Context(), &cTypes.GetCrashesForStreetsParams{
		CNNs:        cnns,
		SegmentSize: segmentSize,
		StartTime:   *startTime,
		EndTime:     *endTime,
	})

	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("error getting traffic crashes for cnns: %v", err))
	}

	return c.JSON(http.StatusOK, result)
}

func (h *handlers) getStreetFeatures(c echo.Context) error {
	featureType, err := parseFeatureType(c)
	if err != nil {
		return err
	}

	result, err := h.sfDataController.GetStreetFeatures(c.Request().Context(), &cTypes.GetStreetFeaturesParams{
		FeatureType: *featureType,
	})

	if err != nil {
		return err
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
