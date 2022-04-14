const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse");
const plantes = require("./planets.mongo");

function isHabitablePlanet(planet) {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6
  );
}

function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(
      path.join(__dirname, "..", "..", "data", "kepler_data.csv")
    )
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", async (data) => {
        if (isHabitablePlanet(data)) {
          // habitablePlanets.push(data);
          // TODO: Replace below create. insert + update = upsert
          await savePlanet(data);
        }
      })
      .on("error", (err) => {
        reject(err);
      })
      .on("end", async () => {
        const countPlanetsFound = (await getAllPlanets()).length;
        resolve();
      });
  });
}

async function getAllPlanets() {
  return await plantes.find(
    {},
    {
      __v: 0,
      _id: 1,
    }
  );
}

async function savePlanet(planet) {
  try {
    await plantes.updateOne(
      {
        keplerName: planet.kepler_name,
      },
      {
        keplerName: planet.kepler_name,
      },
      {
        upsert: true,
      }
    );
  } catch (error) {
    console.error(`Could not save planet ${err}`);
  }
}

module.exports = {
  loadPlanetsData,
  getAllPlanets,
};
