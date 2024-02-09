// convertPressure() {
//   if (
//     this.pressureUnitFrom === "millibar, hPa" &&
//     this.pressureUnitTo === "inHg"
//   ) {
//     this.PressureConvertedValue =
//       (this.PressureInputValue * 0.02953).toFixed(2) + " inHg";
//   } else if (
//     this.pressureUnitFrom === "inHg" &&
//     this.pressureUnitTo === "millibar, hPa"
//   ) {
//     this.PressureConvertedValue =
//       (this.PressureInputValue / 0.02953).toFixed(2) + " millibar, hPa";
//   }
// },
// updateConversionUnits() {
//   this.pressureUnitTo =
//     this.pressureUnitFrom === "millibar, hPa" ? "inHg" : "millibar, hPa";
//   this.convertPressure();
// },

export function convertPressure(value, fromUnit, toUnit) {
  if (fromUnit === "millibar, hPa" && toUnit === "inHg") {
    return (value * 0.02953).toFixed(2) + " inHg";
  } else if (fromUnit === "inHg" && toUnit === "millibar, hPa") {
    return (value / 0.02953).toFixed(2) + " millibar, hPa";
  }
}

// Determine the conversion direction based on the current unit
export function updateConversionUnits(pressureUnitFrom) {
  return pressureUnitFrom === "millibar, hPa" ? "inHg" : "millibar, hPa";
}
