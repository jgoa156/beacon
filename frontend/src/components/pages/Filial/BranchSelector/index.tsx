import { useSelector } from "react-redux";

// Shared
import { H3 } from "components/shared/Titles";
import UserInfo from "components/shared/Header/UserInfo";

// Custom
import EnrollmentGrid from "components/shared/EnrollmentGrid";
import { Wrapper } from "./styles";

// Interface
import { IRootState } from "redux/store";
import IUserLogged from "interfaces/IUserLogged";

export default function BranchSelector() {
  const user = useSelector<IRootState, IUserLogged>((state) => state.user);

  return (
    <Wrapper>
      <div>
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}>
          <H3 style={{ marginBottom: 15 }}>Filial</H3>

          <UserInfo />
        </div>

        <EnrollmentGrid user={user} />
      </div>
    </Wrapper>
  );
}