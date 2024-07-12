import { createHashRouter } from "react-router-dom";
import routes from "./autoRoutes";
// import routes from "./routes";

const router = createHashRouter(routes as any);

export default router;
