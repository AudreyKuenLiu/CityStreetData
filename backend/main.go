package main

import (
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"os"

	"citystreetdata/handlers"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	projDir := os.Getenv("PROJ_DIR")
	env := os.Getenv("ENV")

	// Echo instance
	e := echo.New()

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())
	e.Use(middleware.Gzip())

	//Starting fileserver for webapp
	e.Use(middleware.StaticWithConfig(middleware.StaticConfig{
		Skipper: nil,
		Root:    fmt.Sprintf("%s/frontend/dist", projDir),
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
	if env == "PROD" {
		serverCrt := fmt.Sprintf("%s/.server.crt", projDir)
		serverKey := fmt.Sprintf("%s/.server.key", projDir)

		if err := e.StartTLS(":8080", serverCrt, serverKey); err != nil && !errors.Is(err, http.ErrServerClosed) {
			slog.Error("failed to start server", "error", err)
		}
	}
	if err := e.Start(":80"); err != nil && !errors.Is(err, http.ErrServerClosed) {
		slog.Error("failed to start server", "error", err)
	}

}
