package utils

import (
	"encoding/json"
)

// StringArrayToNumberArray converts a string of an array of digits [n1, n2, n3] into a slice of integers.
func StringArrayToNumberArray[T int | float32 | float64](s string) ([]T, error){
	var numbers []T
	err := json.Unmarshal([]byte(s), &numbers)
	if err != nil {
		return nil, err
	}

	return numbers, nil
}
