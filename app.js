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
      basicWeight: "",
      fuel: 1400,
      fuelErrorMessage: "",
      load: 600,
      loadUnit: "lbs",
      takeoffGW: 0.0,
      qnh: 29.92,
      qnhUnit: "inHg",
      fat: 20,
      indicatedAltitude: "",
      pressureAltitude: "",
      densityAltitude: "",
      maxTQ: null,
      predictedHoverTQ2ft: 0.0,
      predictedHoverTQ4ft: 0.0,
      predictedHoverTQ30ft: 0.0,
      predictedHoverTQ100ft: 0.0,
    };
  },
  watch: {
    selectedAircraft() {
      this.calculateTakeoffGW();
    },
    fuel() {
      this.calculateTakeoffGW();
      this.validateFuel();
    },
    load() {
      this.calculateTakeoffGW();
    },
    loadUnit() {
      this.calculateTakeoffGW();
    },
    qnh() {
      this.calculatePressureAltitude();
      this.calculateDensityAltitude();
    },
    qnhUnit() {
      this.calculatePressureAltitude();
      this.calculateDensityAltitude();
    },
    fat() {
      this.calculatePressureAltitude();
      this.calculateDensityAltitude();
      this.calculateMaxTQ();
    },
    indicatedAltitude() {
      this.calculatePressureAltitude();
      this.calculateDensityAltitude();
      this.calculateMaxTQ();
    },
  },
  methods: {
    updateBasicWeight() {
      this.basicWeight = this.aircraftWeights[this.selectedAircraft] || "";
    },
    validateFuel() {
      const fuelValue = parseFloat(this.fuel);
      if (isNaN(fuelValue) || fuelValue < 200 || fuelValue > 1450) {
        this.fuelErrorMessage = "Fuel must be between 200 and 1450 lbs.";
      } else {
        this.fuelErrorMessage = "";
      }
    },
    calculateTakeoffGW() {
      const basicWeightLbs = this.aircraftWeights[this.selectedAircraft] || 0;
      const loadLbs =
        this.loadUnit === "kg" ? this.load * 2.20462 : parseFloat(this.load);
      const fuelLbs = parseFloat(this.fuel) || 0;

      this.takeoffGW = (basicWeightLbs + loadLbs + fuelLbs).toFixed(0);
    },
    limitIndicatedAltitude(event) {
      if (this.indicatedAltitude < 0) {
        this.indicatedAltitude = 0;
      } else if (this.indicatedAltitude > 14000) {
        this.indicatedAltitude = 14000;
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
      const result = 0.0095 * Math.pow(B23, 2) - 2.1571 * B23 + 166.05;
      return result > 100 ? 100 : result;
    },
    Fat2000() {
      const B20 = parseFloat(this.fat);
      const result =
        -0.00074786 * Math.pow(B20, 3) +
        0.10096154 * Math.pow(B20, 2) -
        5.72457265 * B20 +
        204.30769231;
      return result > 100 ? 100 : result;
    },
    Fat4000() {
      const B17 = parseFloat(this.fat);
      const result =
        -0.00017721 * Math.pow(B17, 3) +
        0.01506658 * Math.pow(B17, 2) -
        1.47211474 * B17 +
        128.53679353;
      return result > 100 ? 100 : result;
    },
    Fat6000() {
      const B14 = parseFloat(this.fat);
      const result =
        0.0000101 * Math.pow(B14, 3) -
        0.00277056 * Math.pow(B14, 2) -
        0.81259019 * B14 +
        112.78571429;
      return result > 100 ? 100 : result;
    },
    Fat8000() {
      const B11 = parseFloat(this.fat);
      const result =
        -0.00005439 * Math.pow(B11, 3) +
        0.00251748 * Math.pow(B11, 2) -
        0.83150738 * B11 +
        104.1;
      return result > 100 ? 100 : result;
    },
    Fat10000() {
      const B8 = parseFloat(this.fat);
      const result =
        0.00000668 * Math.pow(B8, 4) -
        0.00041017 * Math.pow(B8, 3) -
        0.00270513 * Math.pow(B8, 2) -
        0.39245176 * B8 +
        93.94326262;
      return result > 100 ? 100 : result;
    },
    Fat12000() {
      const B5 = parseFloat(this.fat);
      const result =
        0.00000867 * Math.pow(B5, 4) -
        0.0005301 * Math.pow(B5, 3) -
        0.00275058 * Math.pow(B5, 2) -
        0.29468669 * B5 +
        86.69107363;
      return result > 100 ? 100 : result;
    },
    Fat14000() {
      const B2 = parseFloat(this.fat);
      const result =
        0.00000629 * Math.pow(B2, 4) -
        0.00037949 * Math.pow(B2, 3) -
        0.00326224 * Math.pow(B2, 2) -
        0.31544789 * B2 +
        80.16723277;
      return result > 100 ? 100 : result;
    },
    calculateMaxTQ() {
      const N3 = parseFloat(this.pressureAltitude);
      if ((N3 === 0 || N3 > 0) && N3 < 2000) {
        this.maxTQ = this.Fat0() - (this.Fat0() - this.Fat2000()) * (N3 / 2000);
      } else if ((N3 === 2000 || N3 > 2000) && N3 < 4000) {
        this.maxTQ =
          this.Fat2000() -
          ((this.Fat2000() - this.Fat4000()) * (N3 - 2000)) / 2000;
      } else if ((N3 === 4000 || N3 > 4000) && N3 < 6000) {
        this.maxTQ =
          this.Fat4000() -
          ((this.Fat4000() - this.Fat6000()) * (N3 - 4000)) / 2000;
      } else if ((N3 === 6000 || N3 > 6000) && N3 < 8000) {
        this.maxTQ =
          this.Fat6000() -
          ((this.Fat6000() - this.Fat8000()) * (N3 - 6000)) / 2000;
      } else if ((N3 === 8000 || N3 > 8000) && N3 < 10000) {
        this.maxTQ =
          this.Fat8000() -
          ((this.Fat8000() - this.Fat10000()) * (N3 - 8000)) / 2000;
      } else if ((N3 === 10000 || N3 > 10000) && N3 < 12000) {
        this.maxTQ =
          this.Fat10000() -
          ((this.Fat10000() - this.Fat12000()) * (N3 - 10000)) / 2000;
      } else if ((N3 === 12000 || N3 > 12000) && N3 < 14000) {
        this.maxTQ =
          this.Fat12000() -
          ((this.Fat12000() - this.Fat14000()) * (N3 - 12000)) / 2000;
      } else if (N3 === 14000) {
        this.maxTQ = this.Fat14000();
      } else {
        this.maxTQ = null;
      }
      if (typeof this.maxTQ === "number") {
        this.maxTQ = this.maxTQ.toFixed(1); // Convert maxTQ to a string with one decimal place
      } else {
        alert("Check Indicated Altitude between 0 and 14000!");
      }
    },
  },
  computed: {},
}).mount("#app");
