import { createQBHandler } from "../../lib/qbProxy.js";

export default createQBHandler({
  tableEnv:  "QB_NCRS_TABLE_ID",
  reportEnv: "QB_NCRS_REPORT_ID",
  label:     "NCRs",
});
