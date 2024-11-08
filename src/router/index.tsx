import { createHashRouter } from "react-router-dom";
import routes from "./autoRoutes";
const router = createHashRouter(routes as any);

export default router;
