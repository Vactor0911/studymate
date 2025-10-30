import { userAtom } from "../states/auth";
import { useAtomValue } from "jotai";

const Main = () => {
  const user = useAtomValue(userAtom);

  if (!user) {
    return <div>로그인 후 이용해주세요.</div>;
  }
  return <div>Studymate {user.user_id}</div>;
};

export default Main;
