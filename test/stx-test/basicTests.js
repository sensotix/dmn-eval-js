const { decisionTable } = require("../../index");
const { readFileSync } = require("fs");

// prepare input
const params = {
  Lohnsumme: 20000,
  Gefahrenklasse: 1,
  Umsatz: 34000,
  Basispraemie: 8,/* 
  Pauschalversicherungssumme: "1000000",
  Vorteilsdeckung_Gastro: true,
  Rabatt: 0,
  Vorteilsdeckung_Gastro_Pauschalreisen: true,
  Vorteilsdeckung_Handel: true,
  Vorteilsdeckung_KFZ_Betriebe: true,
  Vorteilsdeckung_KFZ_Betriebe_Taetigkeiten_an_KFZ: true,
  Vorteilsdeckung_Baugewerbe: true,
  Vorteilsdeckung_Produktion: true,
  Vorteilsdeckung_Handwerk: true,
  Vorteilsdeckung_Gesundheitsberufe: true,
  Vorteilsdeckung_Baumeister: true,
  Vorteilsdeckung_Apotheken: true,
  Deckungspacket: "Komfort",
  Schluesselverlust: "10000",
  Reine_Vermoegensschaeden_Wegen_Datenverlust: "30000", */
};  

const file = "./DMN/basicsim.dmn";
const dmnTable = "Decision_1lrr0m9";

// read file and run test function
try {
  const xml = readFileSync(file, "utf8");
  calculatePraemie(xml, dmnTable, params);
} catch (err) {
  console.error("error reading file at path: ", file, "err: ", err);
}

async function calculatePraemie(xml, dmnTable, params) {

  const praemie = await decisionTable
    .parseDmnXml(xml)
    .then((decisions) => {
      //console.log("succesullfy parsed");
      //console.log(context);

      try {
        //console.log(utils.inspect(decisions, {showHidden: false, depth: null}))
        const data = decisionTable.evaluateDecision(
          dmnTable,
          decisions,
          params
        );
        return data;
      } catch (err) {
        // failed to evaluate rule, maybe the context is missing some data?
        console.log(err);
      }
    })
    .catch((err) => {
      // failed to parse DMN XML: either invalid XML or valid XML but invalid DMN
      console.log(err); 
    });
  console.log(praemie);
  return praemie;
}
