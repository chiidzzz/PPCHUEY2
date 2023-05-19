Vue.createApp({
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
      fuel: "",
      fuelErrorMessage: "",
      load: "",
      loadUnit: "lbs",
      takeoffGW: 0.0,
      qnh: "",
      qnhUnit: "hPa",
      fat: "",
      indicatedAltitude: "",
      pressureAltitude: 0,
      densityAltitude: 0,
      maxTQ: 0.0,
      predictedHoverTQ2ft: 0.0,
      predictedHoverTQ4ft: 0.0,
      predictedHoverTQ30ft: 0.0,
      predictedHoverTQ100ft: 0.0,
    };
  },
  watch: {
    selectedAircraft() {
      this.updateBasicWeight();
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
    },
    indicatedAltitude() {
      this.calculatePressureAltitude();
      this.calculateDensityAltitude();
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

      const densityAltitude = pressureAltitude + 120 * (temperature - 15);

      this.densityAltitude = isNaN(densityAltitude)
        ? 0
        : densityAltitude.toFixed(0);
    },
  },
  computed: {
    densityAltitude() {
      // Calculation logic for density altitude
    },
  },
}).mount("#app");
