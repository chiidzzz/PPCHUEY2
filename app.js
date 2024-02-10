const app = Vue.createApp({
  data() {
    return {
      currentTab: "PPC",
      pressureUnitFrom: "millibar, hPa",
      pressureUnitTo: "inHg",
      PressureInputValue: null,
      PressureConvertedValue: "",
      mgt: "",
      pwrAssActualtorque: "",
      pwrAssDiff: "",
      resultMRT: "",
      PwrAssFAT: 20,
      PwrAssIA: "",
      PwrAssIAErrorMessage: "",
      PwrAssPressureAltitude: null,
      PwrAssMGTErrorMessage: "",
      pwrAssWarningMessage: "",
      selectedAircraft: "",
      aircraftWeights: {
        L1201: 5682,
        L1202: 5807,
        L1203: 5660,
        L1204: 5652,
        L1205: 5787,
        L1206: 5736,
        L1207: 5791,
        L1208: 5803,
        L1209: 5769,
        L1210: 5764,
        L1211: 5691,
        L1212: 5738,
        L1215: 5740,
        L1216: 5756,
      },
      bucketPercentage: null,
      showDropdown: false,
      showFirefightingText: false,
      fuelErrorMessage: "",
      TOGWErrorMessage: "",
      basicWeight: null,
      fuel: 1400,
      load: 600,
      loadUnit: "lbs",
      takeoffGW: null,
      unroundedTakeoffGW: 0.0,
      qnh: 29.92,
      qnhUnit: "inHg",
      fat: 20,
      TempErrorMessage: "",
      indicatedAltitude: null,
      IAErrorMessage: "",
      pressureAltitude: null,
      densityAltitude: null,
      maxTQ: null,
      predictedHoverTQ2ft: null,
      predictedHoverTQ4ft: null,
      predictedHoverTQ30ft: null,
      predictedHoverTQ100ft: null,
    };
  },
  watch: {
    //converter
    PressureInputValue: "convertPressure",
    pressureUnitFrom: "updateConversionUnits",
    mgt(newVal, oldVal) {
      this.computeMRT();
    },
    pwrAssActualtorque(newVal, oldVal) {
      this.calculateDiff();
    },
  },

  methods: {
    //converter
    convertPressure() {
      if (
        this.pressureUnitFrom === "millibar, hPa" &&
        this.pressureUnitTo === "inHg"
      ) {
        this.PressureConvertedValue =
          (this.PressureInputValue * 0.02953).toFixed(2) + " inHg";
      } else if (
        this.pressureUnitFrom === "inHg" &&
        this.pressureUnitTo === "millibar, hPa"
      ) {
        this.PressureConvertedValue =
          (this.PressureInputValue / 0.02953).toFixed(2) + " millibar, hPa";
      }
    },
    updateConversionUnits() {
      this.pressureUnitTo =
        this.pressureUnitFrom === "millibar, hPa" ? "inHg" : "millibar, hPa";
      this.convertPressure();
    },

    //general
    openTab(tabName) {
      console.log("Switching to tab: ", tabName);
      this.currentTab = tabName;
    },

    //ppc
    updateBasicWeight() {
      this.basicWeight = this.aircraftWeights[this.selectedAircraft] || "";
      this.calculateTakeoffGW();
    },
    validateFuel() {
      const fuelValue = parseFloat(this.fuel);
      if (isNaN(fuelValue) || fuelValue < 200 || fuelValue > 1450) {
        this.fuelErrorMessage = "Check fuel between 200 and 1450 lbs.";
        this.calculateTakeoffGW();
        this.maxTQ = 0;
        this.predictedHoverTQ2ft = null;
        this.predictedHoverTQ4ft = null;
        this.predictedHoverTQ30ft = null;
        this.predictedHoverTQ100ft = null;
      } else {
        this.calculateTakeoffGW();
        this.fuelErrorMessage = "";
      }
    },
    validateTOGW() {
      const TOGWValue = parseFloat(this.takeoffGW);
      if (isNaN(TOGWValue) || TOGWValue < 7500 || TOGWValue > 11200) {
        this.TOGWErrorMessage = "Check TO/GW between 7500 and 11200 lbs.";
        // this.takeoffGW = 0;
        this.maxTQ = 0;
        this.predictedHoverTQ2ft = 0;
        this.predictedHoverTQ4ft = 0;
        this.predictedHoverTQ30ft = 0;
        this.predictedHoverTQ100ft = 0;
      } else {
        this.calculateMaxTQ();
        this.calculateDensityAltitude();
        this.calculatePredictedHoverTQ2ft();
        this.calculatePredictedHoverTQ4ft();
        this.calculatePredictedHoverTQ100ft();
        this.calculatePredictedHoverTQ15ft();
        this.calculatePredictedHoverTQ30ft();
        this.TOGWErrorMessage = "";
      }
    },
    validateTemperature() {
      const temp = parseFloat(this.fat);
      if (isNaN(temp) || temp < -20 || temp > 50) {
        this.TempErrorMessage = "Check Temperature between -20 and 50.";
        this.maxTQ = 0;
        this.predictedHoverTQ2ft = 0;
        this.predictedHoverTQ4ft = 0;
        this.predictedHoverTQ30ft = 0;
        this.predictedHoverTQ100ft = 0;
      } else {
        this.calculateMaxTQ();
        this.calculateDensityAltitude();
        this.calculatePredictedHoverTQ2ft();
        this.calculatePredictedHoverTQ4ft();
        this.calculatePredictedHoverTQ100ft();
        this.calculatePredictedHoverTQ15ft();
        this.calculatePredictedHoverTQ30ft();
        this.TempErrorMessage = "";
      }
    },
    calculateTakeoffGW() {
      const basicWeightLbs = this.aircraftWeights[this.selectedAircraft] || 0;
      const loadLbs =
        this.loadUnit === "kg" ? this.load * 2.20462 : parseFloat(this.load);
      const fuelLbs = parseFloat(this.fuel) || 0;

      this.takeoffGW = (basicWeightLbs + loadLbs + fuelLbs).toFixed(0);
      this.unroundedTakeoffGW = basicWeightLbs + loadLbs + fuelLbs;
      // this.validateFuel();
      this.validateTOGW();
    },
    limitIndicatedAltitude(event) {
      const indicatedAltitude = parseFloat(this.indicatedAltitude);
      if (
        isNaN(indicatedAltitude) ||
        indicatedAltitude < 0 ||
        indicatedAltitude > 14000
      ) {
        this.IAErrorMessage =
          "Check Indicated Altitude between 0 and 14000 ft.";
        this.maxTQ = 0;
        this.predictedHoverTQ2ft = 0;
        this.predictedHoverTQ4ft = 0;
        this.predictedHoverTQ30ft = 0;
        this.predictedHoverTQ100ft = 0;
      } else {
        this.calculatePressureAltitude();
        this.calculateDensityAltitude();
        this.calculateMaxTQ();
        this.calculateDensityAltitude();
        this.calculatePredictedHoverTQ2ft();
        this.calculatePredictedHoverTQ4ft();
        this.calculatePredictedHoverTQ100ft();
        this.calculatePredictedHoverTQ15ft();
        this.calculatePredictedHoverTQ30ft();
        this.IAErrorMessage = "";
      }
    },
    calculatePressureAltitude() {
      const indicatedAltitudeValue = parseFloat(this.indicatedAltitude);
      const qnhValue = parseFloat(this.qnh);
      const qnhFactor = this.qnhUnit === "inHg" ? 1 : 33.8639;
      const pressureAltitude =
        indicatedAltitudeValue + (29.92 - qnhValue / qnhFactor) * 1000;
      this.pressureAltitude = isNaN(pressureAltitude)
        ? 0
        : pressureAltitude.toFixed(0);
    },
    calculateDensityAltitude() {
      const pressureAltitude = parseFloat(this.pressureAltitude);
      const temperature = parseFloat(this.fat);

      const densityAltitude =
        pressureAltitude +
        120 * (temperature - (15 - pressureAltitude * 0.00198));

      this.densityAltitude = isNaN(densityAltitude)
        ? 0
        : densityAltitude.toFixed(0);
    },

    Fat0() {
      const B23 = parseFloat(this.fat);
      return 0.0095 * Math.pow(B23, 2) - 2.1571 * B23 + 166.05;
    },
    Fat2000() {
      const B20 = parseFloat(this.fat);
      return (
        -0.00074786 * Math.pow(B20, 3) +
        0.10096154 * Math.pow(B20, 2) -
        5.72457265 * B20 +
        204.30769231
      );
    },
    Fat4000() {
      const B17 = parseFloat(this.fat);
      return (
        -0.00017721 * Math.pow(B17, 3) +
        0.01506658 * Math.pow(B17, 2) -
        1.47211474 * B17 +
        128.53679353
      );
    },
    Fat6000() {
      const B14 = parseFloat(this.fat);
      return (
        0.0000101 * Math.pow(B14, 3) -
        0.00277056 * Math.pow(B14, 2) -
        0.81259019 * B14 +
        112.78571429
      );
    },
    Fat8000() {
      const B11 = parseFloat(this.fat);
      return (
        -0.00005439 * Math.pow(B11, 3) +
        0.00251748 * Math.pow(B11, 2) -
        0.83150738 * B11 +
        104.1
      );
    },
    Fat10000() {
      const B8 = parseFloat(this.fat);
      return (
        0.00000668 * Math.pow(B8, 4) -
        0.00041017 * Math.pow(B8, 3) -
        0.00270513 * Math.pow(B8, 2) -
        0.39245176 * B8 +
        93.94326262
      );
    },
    Fat12000() {
      const B5 = parseFloat(this.fat);
      return (
        0.00000867 * Math.pow(B5, 4) -
        0.0005301 * Math.pow(B5, 3) -
        0.00275058 * Math.pow(B5, 2) -
        0.29468669 * B5 +
        86.69107363
      );
    },
    Fat14000() {
      const B2 = parseFloat(this.fat);
      return (
        0.00000629 * Math.pow(B2, 4) -
        0.00037949 * Math.pow(B2, 3) -
        0.00326224 * Math.pow(B2, 2) -
        0.31544789 * B2 +
        80.16723277
      );
    },
    calculateMaxTQ() {
      const N3 = parseFloat(this.pressureAltitude);
      const fat0 = this.Fat0();
      const fat2000 = this.Fat2000();
      const fat4000 = this.Fat4000();
      const fat6000 = this.Fat6000();
      const fat8000 = this.Fat8000();
      const fat10000 = this.Fat10000();
      const fat12000 = this.Fat12000();
      const fat14000 = this.Fat14000();
      if ((N3 === 0 || N3 > 0) && N3 < 2000) {
        this.maxTQ = fat0 - (fat0 - fat2000) * (N3 / 2000);
      } else if ((N3 === 2000 || N3 > 2000) && N3 < 4000) {
        this.maxTQ = fat2000 - ((fat2000 - fat4000) * (N3 - 2000)) / 2000;
      } else if ((N3 === 4000 || N3 > 4000) && N3 < 6000) {
        this.maxTQ = fat4000 - ((fat4000 - fat6000) * (N3 - 4000)) / 2000;
      } else if ((N3 === 6000 || N3 > 6000) && N3 < 8000) {
        this.maxTQ = fat6000 - ((fat6000 - fat8000) * (N3 - 6000)) / 2000;
      } else if ((N3 === 8000 || N3 > 8000) && N3 < 10000) {
        this.maxTQ = fat8000 - ((fat8000 - fat10000) * (N3 - 8000)) / 2000;
      } else if ((N3 === 10000 || N3 > 10000) && N3 < 12000) {
        this.maxTQ = fat10000 - ((fat10000 - fat12000) * (N3 - 10000)) / 2000;
      } else if ((N3 === 12000 || N3 > 12000) && N3 < 14000) {
        this.maxTQ = fat12000 - ((fat12000 - fat14000) * (N3 - 12000)) / 2000;
      } else if (N3 === 14000) {
        this.maxTQ = fat14000;
      } else {
        this.maxTQ = null;
      }

      if (typeof this.maxTQ === "number") {
        this.maxTQ = Math.min(this.maxTQ, 100).toFixed(1);
      }
    },

    PAMinus20() {
      const D2 = parseFloat(this.pressureAltitude);
      return 0.0028 * D2 + 1;
    },
    PA0() {
      const D5 = parseFloat(this.pressureAltitude);
      return 0.0025 * D5 + 7;
    },
    PA20() {
      const D8 = parseFloat(this.pressureAltitude);
      return 0.0026 * D8 + 11;
    },
    PA40() {
      const D11 = parseFloat(this.pressureAltitude);
      return 0.0025 * D11 + 16;
    },
    PA60() {
      const D14 = parseFloat(this.pressureAltitude);
      return 0.0025 * D14 + 20;
    },
    calculateVirtualX() {
      const M3 = parseFloat(this.fat);
      const E2 = this.PAMinus20();
      const E5 = this.PA0();
      const E8 = this.PA20();
      const E11 = this.PA40();
      const E14 = this.PA60();

      if (M3 === -20 || (M3 > -20 && M3 < 0)) {
        return E2 + (E5 - E2) * ((M3 + 20) / 20);
      } else if (M3 === 0 || (M3 > 0 && M3 < 20)) {
        return E5 + (E8 - E5) * (M3 / 20);
      } else if (M3 === 20 || (M3 > 20 && M3 < 40)) {
        return E8 + (E11 - E8) * ((M3 - 20) / 20);
      } else if (M3 === 40 || (M3 > 40 && M3 < 60)) {
        return E11 + (E14 - E11) * ((M3 - 40) / 20);
      } else {
        return null;
      }
    },
    VX7500() {
      const G2 = this.calculateVirtualX();
      return (
        0.00000455 * Math.pow(G2, 4) -
        0.00036092 * Math.pow(G2, 3) +
        0.01598776 * Math.pow(G2, 2) -
        0.12107615 * G2 +
        21.29166667
      );
    },
    VX8000() {
      const G5 = this.calculateVirtualX();
      return (
        0.00016301 * Math.pow(G5, 3) -
        0.00416084 * Math.pow(G5, 2) +
        0.25360528 * G5 +
        23.74666667
      );
    },
    VX8500() {
      const G8 = this.calculateVirtualX();
      return (
        0.00017172 * Math.pow(G8, 3) -
        0.0019697 * Math.pow(G8, 2) +
        0.22979798 * G8 +
        28.83333333
      );
    },
    VX9000() {
      const G11 = this.calculateVirtualX();
      return (
        0.0008101 * Math.pow(G11, 3) -
        0.0372987 * Math.pow(G11, 2) +
        0.85134921 * G11 +
        31.17142857
      );
    },
    VX9500() {
      const G14 = this.calculateVirtualX();
      return (
        0.00005 * Math.pow(G14, 4) -
        0.00336869 * Math.pow(G14, 3) +
        0.08238636 * Math.pow(G14, 2) -
        0.39045815 * G14 +
        40.33928571
      );
    },
    VX10000() {
      const G17 = this.calculateVirtualX();
      return (
        0.00088889 * Math.pow(G17, 3) -
        0.03095238 * Math.pow(G17, 2) +
        0.78730159 * G17 +
        42.10714286
      );
    },
    VX10500() {
      const G20 = this.calculateVirtualX();
      return (
        0.001044 * Math.pow(G20, 3) -
        0.027711 * Math.pow(G20, 2) +
        0.715536 * G20 +
        48.007464
      );
    },
    VX11000() {
      const G23 = this.calculateVirtualX();
      return (
        0.00099 * Math.pow(G23, 3) -
        0.009714 * Math.pow(G23, 2) +
        0.372381 * G23 +
        55.257143
      );
    },
    VX11200() {
      const G26 = this.calculateVirtualX();
      return 0.02 * Math.pow(G26, 2) + 0.2 * G26 + 58;
    },
    calculateVirtualY() {
      const O3 = parseFloat(this.unroundedTakeoffGW);
      const H2 = this.VX7500();
      const H5 = this.VX8000();
      const H8 = this.VX8500();
      const H11 = this.VX9000();
      const H14 = this.VX9500();
      const H17 = this.VX10000();
      const H20 = this.VX10500();
      const H23 = this.VX11000();
      const H26 = this.VX11200();

      if (O3 === 7500 || (O3 > 7500 && O3 < 8000)) {
        return H2 + (H5 - H2) * ((O3 - 7500) / 500);
      } else if (O3 === 8000 || (O3 > 8000 && O3 < 8500)) {
        return H5 + (H8 - H5) * ((O3 - 8000) / 500);
      } else if (O3 === 8500 || (O3 > 8500 && O3 < 9000)) {
        return H8 + (H11 - H8) * ((O3 - 8500) / 500);
      } else if (O3 === 9000 || (O3 > 9000 && O3 < 9500)) {
        return H11 + (H14 - H11) * ((O3 - 9000) / 500);
      } else if (O3 === 9500 || (O3 > 9500 && O3 < 10000)) {
        return H14 + (H17 - H14) * ((O3 - 9500) / 500);
      } else if (O3 === 10000 || (O3 > 10000 && O3 < 10500)) {
        return H17 + (H20 - H17) * ((O3 - 10000) / 500);
      } else if (O3 === 10500 || (O3 > 10500 && O3 < 11000)) {
        return H20 + (H23 - H20) * ((O3 - 10500) / 500);
      } else if (O3 === 11000 || (O3 > 11000 && O3 < 11200)) {
        return H23 + (H26 - H23) * ((O3 - 11000) / 200);
      } else if (O3 === 11200) {
        return H26;
      } else {
        return null;
      }
    },
    calculatePredictedHoverTQ2ft() {
      const J2 = this.calculateVirtualY();
      this.predictedHoverTQ2ft =
        -0.000011 * Math.pow(J2, 3) -
        0.000419 * Math.pow(J2, 2) +
        0.80214 * J2 +
        32.043856;
      if (!isNaN(this.predictedHoverTQ2ft)) {
        this.predictedHoverTQ2ft = parseFloat(
          this.predictedHoverTQ2ft.toFixed(1)
        );
      } else {
        this.predictedHoverTQ2ft = null;
      }
    },
    calculatePredictedHoverTQ4ft() {
      const J5 = this.calculateVirtualY();
      this.predictedHoverTQ4ft =
        0.00001249 * Math.pow(J5, 3) -
        0.00218006 * Math.pow(J5, 2) +
        0.86450974 * J5 +
        34.93633987;
      if (!isNaN(this.predictedHoverTQ4ft)) {
        this.predictedHoverTQ4ft = parseFloat(
          this.predictedHoverTQ4ft.toFixed(1)
        );
      } else {
        this.predictedHoverTQ4ft = null;
      }
    },
    calculatePredictedHoverTQ15ft() {
      const J8 = this.calculateVirtualY();
      return (
        -0.00000062 * Math.pow(J8, 3) -
        0.00019146 * Math.pow(J8, 2) +
        0.95976235 * J8 +
        37.50445077
      );
    },

    calculatePredictedHoverTQ100ft() {
      const J11 = this.calculateVirtualY();
      this.predictedHoverTQ100ft =
        -0.000088 * Math.pow(J11, 2) + 1.009451 * J11 + 39.757143;
      if (!isNaN(this.predictedHoverTQ100ft)) {
        this.predictedHoverTQ100ft = parseFloat(
          this.predictedHoverTQ100ft.toFixed(1)
        );
      } else {
        this.predictedHoverTQ100ft = null;
      }
    },
    calculatePredictedHoverTQ30ft() {
      const K8 = this.calculatePredictedHoverTQ15ft();
      const K11 = this.predictedHoverTQ100ft;
      this.predictedHoverTQ30ft = K8 + (K11 - K8) * (15 / 85);
      if (!isNaN(this.predictedHoverTQ30ft)) {
        this.predictedHoverTQ30ft = parseFloat(
          this.predictedHoverTQ30ft.toFixed(1)
        );
      } else {
        this.predictedHoverTQ30ft = null;
      }
    },
    resetForm() {
      this.showFirefightingText = false;
      this.selectedAircraft = "";
      this.fuelErrorMessage = "";
      this.TOGWErrorMessage = "";
      this.basicWeight = null;
      this.fuel = 1400;
      this.load = 600;
      this.loadUnit = "lbs";
      this.takeoffGW = null;
      this.unroundedTakeoffGW = 0.0;
      this.qnh = 29.92;
      this.qnhUnit = "inHg";
      this.fat = 20;
      this.TempErrorMessage = "";
      this.indicatedAltitude = null;
      this.IAErrorMessage = "";
      this.pressureAltitude = null;
      this.densityAltitude = null;
      this.maxTQ = null;
      this.predictedHoverTQ2ft = null;
      this.predictedHoverTQ4ft = null;
      this.predictedHoverTQ30ft = null;
      this.predictedHoverTQ100ft = null;
    },
    toggleDropdown() {
      this.showDropdown = !this.showDropdown;
    },
    setFirefightingLoad(bucketPercentage) {
      // this.resetForm();
      this.load = bucketPercentage === 70 ? 3239 : 4239;
      this.loadUnit = "lbs";
      this.calculateTakeoffGW();
      this.showFirefightingText = true;
      this.showDropdown = false;
      this.bucketPercentage = bucketPercentage;
    },

    //power assurance
    limitPwrAssIndicatedAltitude(event) {
      const indicatedAltitude = parseFloat(this.PwrAssIA);
      if (
        isNaN(indicatedAltitude) ||
        indicatedAltitude < 0 ||
        indicatedAltitude > 10000
      ) {
        this.PwrAssIAErrorMessage =
          "Check Indicated Altitude between 0 and 10000 ft.";
        this.resultMRT = 0;
        this.pwrAssDiff = 0;
      } else {
        this.calculatePwrAssPressureAltitude();
        this.calculatePwrAssVirX();
        this.PwrAssIAErrorMessage = "";
      }
    },
    calculatePwrAssPressureAltitude() {
      const indicatedAltitudeValue = parseFloat(this.PwrAssIA);
      const qnhValue = parseFloat(this.qnh);
      const qnhFactor = this.qnhUnit === "inHg" ? 1 : 33.8639;
      const pressureAltitude =
        indicatedAltitudeValue + (29.92 - qnhValue / qnhFactor) * 1000;
      this.PwrAssPressureAltitude = isNaN(pressureAltitude)
        ? 0
        : pressureAltitude.toFixed(0);
    },
    limitMGT(event) {
      const mgt = parseFloat(this.mgt);
      if (isNaN(mgt) || mgt < 400 || 880 > 880) {
        this.PwrAssMGTErrorMessage = "Check MGT Altitude between 400 and 880.";
        this.resultMRT = 0;
        this.pwrAssDiff = 0;
      } else {
        this.calculatePwrAssPressureAltitude();
        this.calculatePwrAssVirX();
        this.PwrAssMGTErrorMessage = "";
      }
    },
    computeMRT() {
      this.resultMRT = parseFloat(this.calculateMRT().toFixed(1));
      this.calculateDiff();
    },
    calculateDiff() {
      if (this.pwrAssActualtorque) {
        // Check if there's an actual torque value
        const diff = parseFloat(this.pwrAssActualtorque) - this.resultMRT;
        this.pwrAssDiff = parseFloat(diff.toFixed(1));
        // Set the warning message if the difference is negative
        this.pwrAssWarningMessage =
          this.pwrAssDiff < 0
            ? "The difference is negative. Shut down the aircraft."
            : "";
      } else {
        // Reset the warning message if there's no actual torque value
        this.pwrAssWarningMessage = "";
      }
    },
    PwrAssFATminus10() {
      const B6 = parseFloat(this.mgt);
      return (
        -0.000002176 * Math.pow(B6, 3) +
        0.004704132 * Math.pow(B6, 2) -
        2.942152186 * B6 +
        531.135914195
      );
    },
    PwrAssFAT0() {
      const B9 = parseFloat(this.mgt);
      return (
        -0.000004342 * Math.pow(B9, 3) +
        0.009725196 * Math.pow(B9, 2) -
        6.815988615 * B9 +
        1513.83290876
      );
    },
    PwrAssFAT10() {
      const B9 = parseFloat(this.mgt);
      return (
        -0.000004342 * Math.pow(B9, 3) +
        0.009725196 * Math.pow(B9, 2) -
        6.815988615 * B9 +
        1513.83290876
      );
    },
    PwrAssFAT15() {
      const B12 = parseFloat(this.mgt);
      return (
        -0.000003449 * Math.pow(B12, 3) +
        0.007848524 * Math.pow(B12, 2) -
        5.516750478 * B12 +
        1212.264525819
      );
    },
    PwrAssFAT20() {
      const B15 = parseFloat(this.mgt);
      return (
        -0.000001284 * Math.pow(B15, 3) +
        0.002978302 * Math.pow(B15, 2) -
        1.887290123 * B15 +
        310.539950484
      );
    },
    PwrAssFAT25() {
      const B18 = parseFloat(this.mgt);
      return (
        -0.000004668 * Math.pow(B18, 3) +
        0.010934662 * Math.pow(B18, 2) -
        8.10533222 * B18 +
        1920.086763982
      );
    },
    PwrAssFAT30() {
      const B21 = parseFloat(this.mgt);
      return (
        -0.000003648 * Math.pow(B21, 3) +
        0.008790669 * Math.pow(B21, 2) -
        6.642401446 * B21 +
        1593.317837745
      );
    },
    PwrAssFAT35() {
      const B24 = parseFloat(this.mgt);
      return (
        -0.000007062 * Math.pow(B24, 3) +
        0.016841555 * Math.pow(B24, 2) -
        12.964059332 * B24 +
        3240.446679491
      );
    },
    PwrAssFAT40() {
      const B27 = parseFloat(this.mgt);
      return (
        -0.000004601 * Math.pow(B27, 3) +
        0.011281935 * Math.pow(B27, 2) -
        8.813101951 * B27 +
        2211.320364814
      );
    },
    PwrAssFAT45() {
      const B30 = parseFloat(this.mgt);
      return (
        -0.00000387 * Math.pow(B30, 3) +
        0.009691694 * Math.pow(B30, 2) -
        7.69374242 * B30 +
        1953.136257021
      );
    },
    PwrAssFAT50() {
      const B33 = parseFloat(this.mgt);
      return (
        -0.00000523 * Math.pow(B33, 3) +
        0.013030312 * Math.pow(B33, 2) -
        10.438476141 * B33 +
        2702.77433028
      );
    },

    calculatePwrAssVirX() {
      const B38 = parseFloat(this.PwrAssFAT);
      const D3 = this.PwrAssFATminus10();
      const D6 = this.PwrAssFAT0();
      const D9 = this.PwrAssFAT10();
      const D12 = this.PwrAssFAT15();
      const D15 = this.PwrAssFAT20();
      const D18 = this.PwrAssFAT25();
      const D21 = this.PwrAssFAT30();
      const D24 = this.PwrAssFAT35();
      const D27 = this.PwrAssFAT40();
      const D30 = this.PwrAssFAT45();
      const D33 = this.PwrAssFAT50();
      // console.log("B38:", B38);
      // console.log("D3:", D3);
      // console.log("D6:", D6);
      // console.log("D9:", D9);
      // console.log("D12:", D12);
      // console.log("D15:", D15);
      // console.log("D18:", D18);
      // console.log("D21:", D21);
      // console.log("D24:", D24);
      // console.log("D27:", D27);
      // console.log("D30:", D30);
      // console.log("D33:", D33);

      if (B38 >= -10 && B38 < 0) {
        return D3 + (D6 - D3) * ((B38 + 10) / 10);
      } else if (B38 >= 0 && B38 < 10) {
        return D6 + (D9 - D6) * (B38 / 10);
      } else if (B38 >= 10 && B38 < 15) {
        return D9 + (D12 - D9) * ((B38 - 10) / 5);
      } else if (B38 >= 15 && B38 < 20) {
        return D12 + (D15 - D12) * ((B38 - 15) / 5);
      } else if (B38 >= 20 && B38 < 25) {
        return D15 + (D18 - D15) * ((B38 - 20) / 5);
      } else if (B38 >= 25 && B38 < 30) {
        return D18 + (D21 - D18) * ((B38 - 25) / 5);
      } else if (B38 >= 30 && B38 < 35) {
        return D21 + (D24 - D21) * ((B38 - 30) / 5);
      } else if (B38 >= 35 && B38 < 40) {
        return D24 + (D27 - D24) * ((B38 - 35) / 5);
      } else if (B38 >= 40 && B38 < 45) {
        return D27 + (D30 - D27) * ((B38 - 40) / 5);
      } else if (B38 >= 45 && B38 < 50) {
        return D30 + (D33 - D30) * ((B38 - 45) / 5);
      } else {
        return null;
      }
    },
    PressAltPwrAss0() {
      const H3 = this.calculatePwrAssVirX();
      return 1.0459 * H3 + 41.368;
    },
    PressAltPwrAss1000() {
      const H6 = this.calculatePwrAssVirX();
      return 0.9524 * H6 + 39.04;
    },
    PressAltPwrAss2000() {
      const H9 = this.calculatePwrAssVirX();
      return 0.9132 * H9 + 38.261;
    },
    PressAltPwrAss3000() {
      const H12 = this.calculatePwrAssVirX();
      return 0.9013 * H12 + 35.954;
    },
    PressAltPwrAss4000() {
      const H15 = this.calculatePwrAssVirX();
      return 0.8669 * H15 + 34.395;
    },
    PressAltPwrAss5000() {
      const H18 = this.calculatePwrAssVirX();
      return 0.8173 * H18 + 33.637;
    },
    PressAltPwrAss6000() {
      const H21 = this.calculatePwrAssVirX();
      return 0.8 * H21 + 32;
    },
    PressAltPwrAss7000() {
      const H24 = this.calculatePwrAssVirX();
      return 0.7686 * H24 + 30.841;
    },
    PressAltPwrAss8000() {
      const H27 = this.calculatePwrAssVirX();
      return 0.74 * H27 + 29.705;
    },
    PressAltPwrAss9000() {
      const H30 = this.calculatePwrAssVirX();
      return 0.7143 * H30 + 28.571;
    },
    PressAltPwrAss10000() {
      const H33 = this.calculatePwrAssVirX();
      return 0.6813 * H33 + 27.738;
    },
    calculateMRT() {
      const A38 = parseFloat(this.PwrAssPressureAltitude);
      const J3 = this.PressAltPwrAss0();
      const J6 = this.PressAltPwrAss1000();
      const J9 = this.PressAltPwrAss2000();
      const J12 = this.PressAltPwrAss3000();
      const J15 = this.PressAltPwrAss4000();
      const J18 = this.PressAltPwrAss5000();
      const J21 = this.PressAltPwrAss6000();
      const J24 = this.PressAltPwrAss7000();
      const J27 = this.PressAltPwrAss8000();
      const J30 = this.PressAltPwrAss9000();
      const J33 = this.PressAltPwrAss10000();

      if (A38 >= 0 && A38 < 1000) {
        return J3 + (J6 - J3) * (A38 / 1000);
      } else if (A38 >= 1000 && A38 < 2000) {
        return J6 + (J9 - J6) * ((A38 - 1000) / 1000);
      } else if (A38 >= 2000 && A38 < 3000) {
        return J9 + (J12 - J9) * ((A38 - 2000) / 1000);
      } else if (A38 >= 3000 && A38 < 4000) {
        return J12 + (J15 - J12) * ((A38 - 3000) / 1000);
      } else if (A38 >= 4000 && A38 < 5000) {
        return J15 + (J18 - J15) * ((A38 - 4000) / 1000);
      } else if (A38 >= 5000 && A38 < 6000) {
        return J18 + (J21 - J18) * ((A38 - 5000) / 1000);
      } else if (A38 >= 6000 && A38 < 7000) {
        return J21 + (J24 - J21) * ((A38 - 6000) / 1000);
      } else if (A38 >= 7000 && A38 < 8000) {
        return J24 + (J27 - J24) * ((A38 - 7000) / 1000);
      } else if (A38 >= 8000 && A38 < 9000) {
        return J27 + (J30 - J27) * ((A38 - 8000) / 1000);
      } else if (A38 >= 9000 && A38 <= 10000) {
        return J30 + (J33 - J30) * ((A38 - 9000) / 1000);
      } else {
        return null;
      }
    },
  },
  computed: {},
}).mount("#app");
