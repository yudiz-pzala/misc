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

function timeToMs(time) {
  const splitTime = time.split(":");
  const seconds = splitTime[2] ? splitTime[2] * 1000 : "";
  return Number(splitTime[0]) * 60 * 60 * 1000 + Number(splitTime[1]) * 60 * 1000 + seconds;
}

const myHeaders = new Headers();
const token = localStorage.getItem('access_token')
myHeaders.append("authorization", "Bearer "+token);

const requestOptions = {
  method: "GET",
  headers: myHeaders,
  redirect: "follow",
};

fetch("https://yudiz.keka.com/k/api/mytime/attendance/summary", requestOptions)
  .then((response) => response.json())
  .then((result) => {
    const { remaining, remainigMs } = getRemainingTime(result.slice(-1)[0]);
    // console.log({ remaining, remainigMs });
    if (remainigMs < 0) {
      console.log("%c🎉 Your 8 hours aleready completed! 🎉", "background-color: yellow;color: #333;padding: 10px;font-size: 14px;", remaining);
      console.log("");
    } else {
      console.log("%cRemaining hours", "background-color: yellow;color: #333;padding: 10px;font-size: 14px;", remaining);
    }
  })
  .catch((error) => console.log("error", error));

function getRemainingTime(lastEntry) {
  const { shiftEffectiveDuration, breakDurationInHHMM, timeEntries } = lastEntry;
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
  return { remaining, remainigMs };
}
