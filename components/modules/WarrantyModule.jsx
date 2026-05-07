// Thin registration wrapper for the Warranty module.
// The actual dashboard lives in src/WarrantyDashboard.jsx — this file only
// handles self-registration so the shell never needs to reference warranty directly.
import { WarrantyDashboard } from "../../src/WarrantyDashboard.jsx";
import { registerModule } from "../../lib/moduleRegistry.js";
import { colors } from "../../lib/tokens.js";

registerModule({
  id:             "warranty",
  label:          "Warranty Operations",
  iconKey:        "shield",
  group:          "modules",
  component:      WarrantyDashboard,
  defaultProps:   { apiRoute: "/api/warranty-orders", standalone: false },
  accentColor:    colors.brand,
  description:    "Track active warranties, claim risk scores, and expiration timelines across all Awnex orders.",
  overviewStatus: "live",
});
