import { createQBHandler } from "../../lib/qbProxy.js";

export default createQBHandler({
  tableEnv:  "QB_PRODUCTION_TABLE_ID",
  reportEnv: "QB_PRODUCTION_REPORT_ID",
  label:     "production",
});
