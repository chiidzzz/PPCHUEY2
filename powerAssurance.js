function calculatePressureAltitude(qnh, indicatedAltitude, qnhUnit) {
  let qnhInHg = qnhUnit === "inHg" ? qnh : qnh / 33.8639; // Convert to inHg if necessary
  let pressureAltitude = indicatedAltitude + (29.92 - qnhInHg) * 1000;
  return pressureAltitude;
}
function calculateVirX(mgt) {
  let result;
  if (mgt === -10) {
    result =
      -0.00000146 * mgt ** 3 +
      0.002981199 * mgt ** 2 -
      1.573492816 * mgt +
      184.638553469;
  } else if (mgt === 0) {
    result =
      -0.000002176 * mgt ** 3 +
      0.004704132 * mgt ** 2 -
      2.942152186 * mgt +
      531.135914195;
  } else if (mgt === 10) {
    result =
      -0.000004342 * mgt ** 3 +
      0.009725196 * mgt ** 2 -
      6.815988615 * mgt +
      1513.83290876;
  } else if (mgt === 15) {
    result =
      -0.000003449 * mgt ** 3 +
      0.007848524 * mgt ** 2 -
      5.516750478 * mgt +
      1212.264525819;
  } else if (mgt === 20) {
    result =
      -0.000001284 * mgt ** 3 +
      0.002978302 * mgt ** 2 -
      1.887290123 * mgt +
      310.539950484;
  } else if (mgt === 25) {
    result =
      -0.000004668 * mgt ** 3 +
      0.010934662 * mgt ** 2 -
      8.10533222 * mgt +
      1920.086763982;
  } else if (mgt === 30) {
    result =
      -0.000003648 * mgt ** 3 +
      0.008790669 * mgt ** 2 -
      6.642401446 * mgt +
      1593.317837745;
  } else if (mgt === 35) {
    result =
      -0.000007062 * mgt ** 3 +
      0.016841555 * mgt ** 2 -
      12.964059332 * mgt +
      3240.446679491;
  } else if (mgt === 40) {
    result =
      -0.000004601 * mgt ** 3 +
      0.011281935 * mgt ** 2 -
      8.813101951 * mgt +
      2211.320364814;
  } else if (mgt === 45) {
    result =
      -0.00000387 * mgt ** 3 +
      0.009691694 * mgt ** 2 -
      7.69374242 * mgt +
      1953.136257021;
  } else if (mgt === 50) {
    result =
      -0.00000523 * mgt ** 3 +
      0.013030312 * mgt ** 2 -
      10.438476141 * mgt +
      2702.77433028;
  } else {
    result = 0;
  }
  result = Math.max(result, 0);
  result = Math.min(result, 100);

  return result;
}

function calculateMRT(altitude, virXResult) {
  let mrt;
  switch (altitude) {
    case 0:
      mrt = 1.0459 * virXResult + 41.368;
      break;
    case 1000:
      mrt = 0.9524 * virXResult + 39.04;
      break;
    case 2000:
      mrt = 0.9132 * virXResult + 38.261;
      break;
    case 3000:
      mrt = 0.9013 * virXResult + 35.954;
      break;
    case 4000:
      mrt = 0.8669 * virXResult + 34.395;
      break;
    case 5000:
      mrt = 0.8173 * virXResult + 33.637;
      break;
    case 6000:
      mrt = 0.8 * virXResult + 32;
      break;
    case 7000:
      mrt = 0.7686 * virXResult + 30.841;
      break;
    case 8000:
      mrt = 0.74 * virXResult + 29.705;
      break;
    case 9000:
      mrt = 0.7143 * virXResult + 28.571;
      break;
    case 10000:
      mrt = 0.6813 * virXResult + 27.738;
      break;
    default:
      mrt = 0;
  }

  mrt = Math.max(mrt, 40);
  mrt = Math.min(mrt, 100);

  return mrt;
}

export { calculateMRT };
export { calculateVirX };
