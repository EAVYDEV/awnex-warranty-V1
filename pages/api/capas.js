import { createQBHandler } from "../../lib/qbProxy.js";

export default createQBHandler({
  tableEnv:  "QB_CAPAS_TABLE_ID",
  reportEnv: "QB_CAPAS_REPORT_ID",
  label:     "CAPAs",
});
