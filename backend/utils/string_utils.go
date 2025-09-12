package utils

import (
	"fmt"
	"strconv"
	"strings"
)

// PointArrayToNumberArray converts a coordinate point -123.4132,48.23141 to an array of type [float, float]
func PointArrayToNumberArray(s string) ([]float64, error){
	sArr := strings.Split(s, ",")
	if len(sArr) != 2 {
		return nil, fmt.Errorf("array length is not 2")
	}
	p1, err := strconv.ParseFloat(sArr[0], 64)
	if err != nil {
		return nil, err
	}
	p2, err := strconv.ParseFloat(sArr[1], 64)
	if err != nil {
		return nil, err
	}

	return []float64{p1, p2}, nil
}
