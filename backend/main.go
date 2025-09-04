package main

import (
	"errors"
	"log/slog"
	"net/http"

	"citystreetdata/handlers"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	// Echo instance
	e := echo.New()

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	//Starting fileserver for webapp
	e.Use(middleware.StaticWithConfig(middleware.StaticConfig{
		Skipper: nil,
		Root: "/frontend/dist",
		// Index file for serving a directory.
		Index: "index.html",
		// Enable HTML5 mode by forwarding all not-found requests to root so that
		// SPA (single-page application) can handle the routing.
		HTML5:      true,
		Browse:     false,
		IgnoreBase: false,
		Filesystem: nil,
	}))

	// Routes
	h, err := handlers.NewHandlers(handlers.Params{EchoInstance: e})
	if err != nil {
		slog.Error("failed to initialize handlers", "error", err)
		return
	}
	h.InitHandlers()

	// Start server
	if err := e.Start(":8080"); err != nil && !errors.Is(err, http.ErrServerClosed) {
		slog.Error("failed to start server", "error", err)
	}
}
