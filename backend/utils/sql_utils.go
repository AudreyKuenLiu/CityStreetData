package utils

import (
	"fmt"
	"strings"
)

func ArrayToSqlStringArray[T any](arr []T, lToken *string, rToken *string) string {
	stringArr := []string{}
	for _, v := range arr {
		stringArr = append(stringArr, fmt.Sprintf("%v", v))
	}

	if lToken != nil && rToken != nil {
		for i := 0; i < len(stringArr); i += 1 {
			stringArr[i] = fmt.Sprintf("%s%s%s", *lToken, stringArr[i], *rToken)
		}
	}

	return strings.Join(stringArr, ",")
}
