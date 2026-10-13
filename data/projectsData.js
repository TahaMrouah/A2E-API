
const centralHills = [
  ["Lot Commercial-01-08", 1, "Angle BD", "6,5 × 8,4 m", 57, 28, 85, 71, 2440000, 34366],
  ["Lot Commercial-01-09", 1, "Voie", "6,39 m", 57, 28, 85, 71, 1760000, 24789],
  ["Lot Commercial-20-01", 2, "BD", "3,5 m", 53, 26, 79, 66, 1630000, 24697],
  ["Lot Commercial-20-02", 2, "BD", "3,5 m", 54, 27, 81, 67.5, 1670000, 24741],
  ["Lot Commercial-20-03", 2, "BD", "3,5 m", 54, 27, 81, 67.5, 1670000, 24741],
  ["Lot Commercial-20-04", 2, "BD", "3,5 m", 54, 27, 81, 67.5, 1670000, 24741],
  ["Lot Commercial-20-08", 2, "Angle BD", "8,8 × 6 m", 56, 28, 84, 70, 2410000, 34429],
  ["Lot Commercial-20-09", 2, "Voie", "7,3 m", 49, 24, 73, 61, 1510000, 24754],
  ["Lot Commercial-20-10", 2, "Voie", "6,7 m", 58, 29, 87, 72.5, 1570000, 21655],
].map(([id, phase, location, frontage, rdc, mezzanine, total, weighted, price, priceM2]) => ({
  id, phase, location, frontage, rdc, mezzanine, total, weighted, price, priceM2,
}));

function makeOffice(building, floor, number) {
  const id = `Bureau Building${building}-${floor === "RDC" ? "0" : floor.slice(2)}-${String(number).padStart(2, "0")}`;

  if (building === 1) {
    const data = {
      1: [70, 86, 80, 1140000, 14250, "Sud-Est"],
      2: [64, 80, 74, 1050000, 14189, "Sud-Est"],
      3: [67, 83, 77, 1060000, 13766, "Nord-Ouest"],
      4: [64, 80, 74, 1030000, 13919, "Nord-Ouest"],
      5: [64, 80, 74, 1030000, 13919, "Nord-Ouest"],
      6: [64, 80, 74, 1030000, 13919, "Nord-Ouest"],
      7: [64, 80, 74, 1030000, 13919, "Nord-Ouest"],
      10: [61, 77, 71, 1010000, 14225, "Sud-Est"],
    }[number];

    if (!data) return null;

    const [habitable, total, saleable, price, priceM2, orientation] = data;

    return {
      id, building, floor, number, habitable, total, saleable,
      price, priceM2, orientation, facades: 1,
      covered: 4, courtyard: 0, parking: 12,
    };
  }

  const data = {
    1: [59, 63, 63, 890000, 14127, "Sud-Est", 1, null],
    2: [59, 63, 63, 890000, 14127, "Sud-Est", 1, null],
    3: [60, 64, 64, 910000, 14219, "Sud-Est - Nord-Est", 2, null],
    4: [57, 73, 67, 960000, 14328, "Nord-Est - Nord-Ouest", 2, 12],
    5: [64, 80, 74, 1030000, 13919, "Nord-Ouest", 1, 12],
    6: [64, 80, 74, 1030000, 13919, "Nord-Ouest", 1, 12],
    7: [64, 80, 74, 1030000, 13919, "Nord-Ouest", 1, 12],
    8: [64, 80, 74, 1030000, 13919, "Nord-Ouest", 1, 12],
    9: [67, 83, 77, 1060000, 13766, "Nord-Ouest", 1, 12],
  }[number];

  if (!data || floor === "RDC") return null;
  if (floor === "R+4" && number === 4) return null;

  const [habitable, total, saleable, price, priceM2, orientation, facades, parking] = data;

  return {
    id, building, floor, number, habitable, total, saleable,
    price, priceM2, orientation, facades,
    covered: 4, courtyard: 0, parking,
  };
}

const officeFloorNumbers = {
  1: {
    "R+1": [1, 2, 3, 4, 5, 6, 7, 10],
    "R+2": [1, 2, 3, 4, 5, 6],
    "R+3": [1, 2, 3, 4, 5, 6, 7, 10],
    "R+4": [2, 3, 6, 7],
    "R+5": [1, 2, 3, 4, 5, 6, 10],
    "R+6": [1, 2, 3, 4, 10],
  },
  2: {
    "R+1": [3, 5, 6, 7, 8, 9],
    "R+2": [4, 5, 6, 7, 8, 9],
    "R+3": [3, 5, 6, 7, 8, 9],
    "R+4": [1, 3, 5, 6, 7, 8, 9],
    "R+5": [1, 2, 5, 6, 7, 8, 9],
    "R+6": [5, 6, 7, 8, 9],
  },
};

const regularOffices = Object.entries(officeFloorNumbers).flatMap(
  ([building, floors]) =>
    Object.entries(floors).flatMap(([floor, numbers]) =>
      numbers.map((n) => makeOffice(Number(building), floor, n)).filter(Boolean)
    )
);

const groundOffices = [
  ["Bureau Building 2-0-01", 1, "Sud-Est", 1, 62, 0, 52, 12, 126, 85, 1210000, 14180],
  ["Bureau Building 2-0-02", 2, "Sud-Est", 1, 63, 0, 38, 12, 113, 82, 1160000, 14204],
  ["Bureau Building 2-0-03", 3, "Sud-Est - Nord-Est", 2, 63, 0, 94, 12, 169, 100, 1430000, 14252],
  ["Bureau Building 2-0-04", 4, "Nord-Est - Nord-Ouest", 2, 43, 20, 119, null, 182, 103, 1470000, 14318],
  ["Bureau Building 2-0-05", 5, "Nord-Ouest", 1, 48, 20, 34, null, 102, 79, 1100000, 13866],
  ["Bureau Building 2-0-06", 6, "Nord-Ouest", 1, 48, 20, 34, null, 102, 79, 1100000, 13866],
  ["Bureau Building 2-0-07", 7, "Nord-Ouest", 1, 61, 26, 42, 12, 141, 107, 1480000, 13832],
  ["Bureau Building2-0-09", 9, "Sud-Est", 1, 57, 0, 51, null, 108, 74, 1050000, 14189],
].map(([id, number, orientation, facades, habitable, covered, courtyard, parking, total, saleable, price, priceM2]) => ({
  id, building: 2, floor: "RDC", number, orientation, facades,
  habitable, covered, courtyard, parking, total, saleable, price, priceM2,
}));

const greenLotus = [...groundOffices, ...regularOffices];

export { greenLotus, centralHills };
