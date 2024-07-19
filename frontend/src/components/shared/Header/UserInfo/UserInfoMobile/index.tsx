import { useDispatch, useSelector } from "react-redux";
import { defaultCourse } from "redux/slicer/user";

// Custom
import {
  Wrapper,
  UserPic,
  UserName,
  UserRoleWrapper,
  UserRole,
  UserGroup,
} from "./styles";

// Interfaces
import { IRootState } from "redux/store";
import IUserLogged from "interfaces/IUserLogged";
import { UserTypes } from "constants/userTypes.constants";

export default function UserInfoMobile() {
  const dispatch = useDispatch();
  const user = useSelector<IRootState, IUserLogged>((state) => state.user);

  return (
    <Wrapper>
      <UserPic>
        <img
          src={user?.profileImage && user?.profileImage.length > 0
            ? user?.profileImage
            : `${process.env.img}/user.png`
          }
          alt={user?.name}
          onError={({ currentTarget }) => {
            currentTarget.src = `${process.env.img}/user.png`;
          }}
        />
      </UserPic>
      <UserName>{user?.name}</UserName>

      <UserRoleWrapper>
        <UserRole>{UserTypes[user.userTypeId]}</UserRole>
        {(user?.userTypeId === 1) ? (
          <UserGroup>Matriz</UserGroup>
        ) : (user?.userTypeId === 2 && user?.selectedBranch) && (
          <UserGroup>
            {user?.selectedBranch?.name}
          </UserGroup>
        )}
      </UserRoleWrapper>
    </Wrapper>
  );
}
