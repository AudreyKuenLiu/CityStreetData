package utils

import (
	"fmt"
	"strings"
)

func ArrayToSqlStringArray[T any](arr []T, wrapper *string) string {
	stringArr := []string{}
	for _, v := range arr {
		stringArr = append(stringArr, fmt.Sprintf("%v", v))
	}

	if wrapper != nil {
		for i := 0; i < len(stringArr); i += 1 {
			stringArr[i] = fmt.Sprintf("%s%s%s", *wrapper, stringArr[i], *wrapper)
		}
	}

	return strings.Join(stringArr, ",")
}
