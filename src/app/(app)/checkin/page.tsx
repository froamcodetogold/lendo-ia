import { Suspense } from "react";
import { CheckInFlow } from "./checkin-flow";

export default function CheckInPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Check-in de leitura</h1>
      <div className="mt-6">
        <Suspense>
          <CheckInFlow />
        </Suspense>
      </div>
    </div>
  );
}
