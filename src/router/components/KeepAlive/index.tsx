import React from "react";
import { KeepAliveContext } from "./context";
import { useMatchRoutes } from "../PermissionRouter";

const KeepAliveView: React.FC<{ children?: React.ReactNode }> = () => {
  const { catchNodes, addCatchNode } = useContext(KeepAliveContext);
  const outlet = useOutlet();
  const matchRoutes = useMatchRoutes();
  const route = useMemo(() => matchRoutes.at(-1)?.route, [matchRoutes]);

  useEffect(() => {
    if (!route?.keepAlive || !route?.fullPath || catchNodes[route.fullPath]) return;
    addCatchNode(route.fullPath, outlet);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route?.fullPath]);

  return (
    <>
      {!route?.keepAlive && outlet}
      {Object.keys(catchNodes).map(key => {
        return (
          <div style={{ height: "100%" }} key={key} hidden={key !== route?.fullPath}>
            {catchNodes[key]}
          </div>
        );
      })}
    </>
  );
};

export default KeepAliveView;
