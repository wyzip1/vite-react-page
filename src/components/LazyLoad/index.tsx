import { Suspense } from "react";
import Loading from "../Loading";

const LazyLoad: React.FC<{ ImportValue: any }> = ({ ImportValue }) => {
  return (
    <Suspense fallback={<Loading />}>
      <ImportValue />
    </Suspense>
  );
};

export function createLazyLoad(ImportValue: any) {
  return <LazyLoad ImportValue={ImportValue} />;
}

export default LazyLoad;
