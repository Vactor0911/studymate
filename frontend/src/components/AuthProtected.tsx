import { useAtomValue } from "jotai";
import type { ReactNode } from "react";
import { userAtom } from "../states/auth";
import { Navigate } from "react-router";

const AuthProtected = ({ children }: { children: ReactNode }) => {
  const user = useAtomValue(userAtom);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default AuthProtected;
