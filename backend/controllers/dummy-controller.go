package controllers

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/twpayne/go-geos"
	pgxgeos "github.com/twpayne/pgx-geos"
)

type DummyController struct {
}

func NewDummyController() *DummyController {

	c := DummyController{}

	return &c
}

// A Waypoint is a location with an identifier and a name.
type Waypoint struct {
	ID       int
	Name     string
	Geometry *geos.Geom
}

func (dc *DummyController) PingDB() ([]Waypoint, error) {
	ctx := context.Background()

	connString := fmt.Sprintf("user=%s password=%s host=%s port=%s dbname=%s sslmode=disable",
		os.Getenv("PGUSER"),
		os.Getenv("PGPASSWORD"),
		os.Getenv("PGHOST"),
		os.Getenv("PGPORT"),
		os.Getenv("PGDATABASE"),
	)

	//setup config
	config, err := pgxpool.ParseConfig(connString)
	if err != nil {
		return nil, err
	}
	config.AfterConnect = func(funcCtx context.Context, conn *pgx.Conn) error {
		res, err := conn.Exec(ctx, `create extension if not exists postgis;`)
		if err != nil {
			fmt.Println("this is the error from creating extension", err)
			return err
		}
		fmt.Printf("this is the result from trying to create a transaction: %v\n", res.String())
		if err := pgxgeos.Register(funcCtx, conn, geos.NewContext()); err != nil {
			return err
		}
		return nil
	}

	dbpool, err := pgxpool.NewWithConfig(ctx, config)
	defer dbpool.Close()
	if err != nil {
		return nil, err
	}

	superUserRows, err := dbpool.Query(ctx, "SELECT * FROM pg_user WHERE usename = 'totoro';")
	if err != nil {
		fmt.Println("this is the error from trying to select * from pg_user", err)
		return nil, err
	}
	defer superUserRows.Close()

	// Get column names
	fieldDescriptions := superUserRows.FieldDescriptions()
	columnNames := make([]string, len(fieldDescriptions))
	for i, fd := range fieldDescriptions {
		columnNames[i] = string(fd.Name)
	}

	// Read and print rows
	for superUserRows.Next() {
		values, err := superUserRows.Values()
		if err != nil {
			log.Fatalf("Failed to read row: %v", err)
		}

		fmt.Println("User row:")
		for i, val := range values {
			fmt.Printf("  %s: %v\n", columnNames[i], val)
		}
	}

	if err := superUserRows.Err(); err != nil {
		log.Fatalf("Row iteration error: %v", err)
	}

	//Create DB
	fmt.Printf("==============creating db================\n")

	_, err = dbpool.Exec(ctx, `
		create table if not exists waypoints (
			id serial primary key,
			name text not null,
			geom geometry(POINT, 4326) not null
		);
	`)
	fmt.Printf("done creating db: %v\n", err)

	if err != nil {
		return nil, err
	}

	//Begin transaction
	tx, err := dbpool.Begin(ctx)
	defer tx.Rollback(ctx)
	if err != nil {
		return nil, err
	}

	//Populate DB
	data := []Waypoint{
		{
			Name:     "London",
			Geometry: geos.NewPoint([]float64{0.1275, 51.50722}).SetSRID(4326),
		},
		{
			Name:     "Berlin",
			Geometry: geos.NewPoint([]float64{13.405, 52.52}).SetSRID(4326),
		},
	}

	fmt.Printf("==============inserting db================\n")
	for _, waypoint := range data {
		if _, err := dbpool.Exec(ctx, `insert into waypoints (name, geom) values ($1, $2);`, waypoint.Name, waypoint.Geometry); err != nil {
			return nil, err
		}
	}
	fmt.Printf("done inserting db\n")

	//Query DB
	fmt.Printf("==============querying db================\n")
	rows, err := dbpool.Query(ctx, "select id, name, geom from waypoints order by id asc;")
	fmt.Printf("done querying db  %v\n", err)

	ret := []Waypoint{}
	for rows.Next() {
		var waypoint Waypoint
		if err := rows.Scan(&waypoint.ID, &waypoint.Name, &waypoint.Geometry); err != nil {
			return nil, err
		}
		ret = append(ret, waypoint)
	}

	//Reset DB
	fmt.Printf("==============resetting db================\n")
	_, err = dbpool.Exec(ctx, `
		DROP TABLE waypoints;
	`)
	tx.Commit(ctx)
	fmt.Printf("==============done resetting db================\n")

	return ret, err
}
