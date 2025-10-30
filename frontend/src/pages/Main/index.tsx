import { userAtom } from "../../states/auth";
import { useAtomValue } from "jotai";
import AuthedMain from "./AuthedMain";

const Main = () => {
  const user = useAtomValue(userAtom);

  if (!user) {
    return <div>로그인 후 이용해주세요.</div>;
  }
  return <AuthedMain />;
};

export default Main;
