const app = Vue.createApp({
  data() {
    return {
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
        L1214: 5748,
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
  watch: {},
  methods: {
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
      this.resetForm();
      this.load = bucketPercentage === 70 ? 3070 : 4070;
      this.loadUnit = "lbs";
      this.calculateTakeoffGW();
      this.showFirefightingText = true;
      this.showDropdown = false;
      this.bucketPercentage = bucketPercentage;
    },
  },
  computed: {},
}).mount("#app");
