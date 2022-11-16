/* 
Console code
var script = document.createElement('script');script.src = "https://pzala-yudiz.github.io/misc/keka-shift-details.js";document.getElementsByTagName('head')[0].appendChild(script);
 */
function msToHMS(ms) {
  // 1- Convert to seconds:
  let seconds = ms / 1000;
  // 2- Extract hours:
  const hours = parseInt(seconds / 3600); // 3,600 seconds in 1 hour
  seconds = seconds % 3600; // seconds remaining after extracting hours
  // 3- Extract minutes:
  const minutes = parseInt(seconds / 60); // 60 seconds in 1 minute
  // 4- Keep only seconds not extracted to minutes:
  seconds = seconds % 60;
  // alert( hours+":"+minutes+":"+seconds);
  return hours + ":" + minutes + ":" + Math.round(seconds);
}

/**
 * @param {string} time HH:MM:SS
 * @return {number} mili seconds
 * */
function timeToMs(time) {
  const splitTime = time.split(":");
  const seconds = splitTime[2] ? splitTime[2] * 1000 : "";
  return Number(splitTime[0]) * 60 * 60 * 1000 + Number(splitTime[1]) * 60 * 1000 + seconds;
}

var kekaAPIheaders = new Headers();
var miscToken = localStorage.getItem("access_token");
if (!miscToken) {
  console.warn("missing storage access_token");
}
kekaAPIheaders.append("authorization", "Bearer " + miscToken);
/Users/yudiz-parth/Documents/Projects/Tutorials/misc-repo/keka-shift-details.min.js
var requestOptions = {
  method: "GET",
  headers: kekaAPIheaders,
  redirect: "follow",
};

fetch("https://yudiz.keka.com/k/api/mytime/attendance/summary", requestOptions)
  .then((response) => response.json())
  .then((result) => {
    const { remaining, shiftStartTimeDateObj, breakDurationInHHMM, attendMs, shiftEndPredict, remainingBreakTime } = getRemainingTime(result.slice(-1)[0]);
    console.table([
      {
        "Shift Start": shiftStartTimeDateObj.toLocaleTimeString(),
        "Total Break": breakDurationInHHMM,
        "Remaining Break": remainingBreakTime,
        "Total Attend Time": msToHMS(attendMs),
        "Remaining Time": remaining,
        "Shift End": shiftEndPredict,
      },
    ]);
  })
  .catch((error) => console.log("error", error));

function getRemainingTime(lastEntry) {
  const { shiftEffectiveDuration, breakDurationInHHMM, timeEntries, shiftEndTime } = lastEntry;
  const { actualTimestamp, originalPunchStatus } = timeEntries[0];
  if (originalPunchStatus !== 0) {
    console.log("%cWaiting for keka to update punch status", "background-color: #528FF0;color: #333;padding: 10px;font-size: 14px;");
  }

  const shiftStartTimeDateObj = new Date(actualTimestamp);
  const current = new Date();

  const totalDifferenceMs = current.getTime() - shiftStartTimeDateObj.getTime();
  const breakTimeMs = timeToMs(breakDurationInHHMM);

  const attendMs = totalDifferenceMs - breakTimeMs;

  const shiftSplitArr = shiftEffectiveDuration.toString().split(".");
  if (!shiftSplitArr[1]) {
    shiftSplitArr[1] = "0";
  } else if (shiftSplitArr[1].length === 1) {
    shiftSplitArr[1] += "0";
  }

  const shiftTimeMs = timeToMs(shiftSplitArr.join(":"));
  const remainigMs = shiftTimeMs - attendMs;
  const remaining = msToHMS(remainigMs);

  const shiftEndPredictDateObj = new Date(current.getTime() + remainigMs)
  const shiftEndPredict = shiftEndPredictDateObj.toLocaleTimeString();
  // remaining break time
  const shiftEndDateObj = new Date(shiftEndTime)
  const remainingBreakMs = shiftEndDateObj.getTime() - shiftEndPredictDateObj.getTime()
  const remainingBreakTime = msToHMS(remainingBreakMs)

  return { remaining, remainigMs, shiftEndPredict, shiftStartTimeDateObj, breakDurationInHHMM, attendMs, remainingBreakTime };
}
