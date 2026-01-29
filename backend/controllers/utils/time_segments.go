package utils

import (
	"citystreetdata/controllers/types"
	"math"

	"time"
)

func BuildTimeSegmentMap[T any](startTime time.Time, endTime time.Time, timesegment types.TimeSegmentSize) (map[int64]T, func(occuredTime int64, curPos int) (int64, int)) {
	dateToCrashesGroupMap := map[int64]T{}
	timeSlices := []int64{}
	loc, _ := time.LoadLocation("America/Los_Angeles")
	itTime := startTime.In(loc)

	for itTime.Unix() < endTime.Unix() {
		unixTime := itTime.Unix()
		dateToCrashesGroupMap[unixTime] = *new(T)
		timeSlices = append(timeSlices, unixTime)
		years, months, days := timesegment.SegmentInYearMonthDays()
		itTime = itTime.AddDate(years, months, days)
	}

	findClosestTime := func(occuredTime int64, curPos int) (int64, int) {
		i := curPos
		for i < len(timeSlices) {
			curTime := timeSlices[i]
			nextTime := int64(math.MaxInt64)
			if i+1 < len(timeSlices) {
				nextTime = timeSlices[i+1]
			}
			if curTime <= occuredTime && occuredTime < nextTime {
				return curTime, i
			}
			i += 1
		}
		return timeSlices[len(timeSlices)-1], i
	}

	return dateToCrashesGroupMap, findClosestTime
}
