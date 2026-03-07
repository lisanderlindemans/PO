function noodStop() {
  if (state === "READY") {
    state = "ESTOP";
  } else if (state !== "TIMEUP" && state !== "PARKED") {
    state = "ESTOP";
  }
  render();
}