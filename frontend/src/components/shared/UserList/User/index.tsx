import { useState } from "react";
import { Dropdown, OverlayTrigger, Tooltip } from "react-bootstrap";

// Custom
import {
  Item,
  Column,
  Ribbon,
  DropdownMenu,
  DropdownItem,
  Options,
  CustomFormCheck,
  CheckboxPreventClick,
  UserStatus,
} from "./styles";
import Spinner from "components/shared/Spinner";

// Interfaces
import IUser from "interfaces/IUser";
interface IUserProps {
  user?: IUser | null;
  subRoute?: string;
  loading?: boolean;
  header?: boolean;

  fetchingDelete?: boolean;
  onDelete?: Function;
  onChange?: Function;

  checkedIds?: number[];
  setCheckedIds?: React.Dispatch<React.SetStateAction<number[]>>;
}

export default function User({
  user = null,
  subRoute = "",
  loading = false,
  header = false,

  fetchingDelete = false,
  onDelete = () => { },
  onChange = () => { },

  checkedIds = [],
  setCheckedIds = () => { },
  ...props
}: IUserProps) {
  function handleDropdown(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  const [confirmDeletion, setConfirmDeletion] = useState<boolean>(false);
  function handleDeletion(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!confirmDeletion) setConfirmDeletion(!confirmDeletion);
    else onDelete();
  }

  function handleCheck(e) {
    e.stopPropagation();

    let allValues = [];
    const checks = document.getElementsByName("users");

    checks.forEach((check) => {
      if ("value" in check && check.value != "all") {
        let _value = parseInt(check.value as string) as never;
        allValues.push(_value);
      }
    });

    if (e.target.value != "all") {
      const value = parseInt(e.target.value);
      const index = checkedIds.indexOf(value);

      // Hardcopying the array
      let _checkedIds = JSON.parse(JSON.stringify(checkedIds));

      if (e.target.checked && index === -1) {
        _checkedIds.push(value);
      } else if (!e.target.checked && index !== -1) {
        _checkedIds.splice(index, 1);
      }

      setCheckedIds(_checkedIds);

      const checkboxAll = document.getElementById("check-all");
      if (checkboxAll != null && "checked" in checkboxAll) {
        checkboxAll.checked = JSON.stringify(_checkedIds.sort()) === JSON.stringify(allValues);
      }
    } else {
      checks.forEach((check) => {
        if ("checked" in check) {
          check["checked"] = e.target.checked;
        }
      });

      setCheckedIds(e.target.checked ? allValues : []);
    }
  }

  // Branches column
  function BranchesColumnTooltip({ branches }) {
    return (
      <>
        {branches.map((branch, index) => <p key={index} style={{ margin: 0 }}>{branch.name}</p>)}
      </>
    );
  }

  return (
    header
      ? <Item header={true} student={subRoute === "alunos"}>
        <CustomFormCheck
          id="check-all"
          inline
          name="users"
          value={"all"}
          label={""}
          onClick={(e) => handleCheck(e)}
        />
        <Column color={"var(--muted)"}>Nome</Column>
        <Column color={"var(--muted)"}>Email</Column>
        <Column color={"var(--muted)"}>Filiais</Column>
        <Column color={"var(--muted)"}>Status</Column>
      </Item>
      : loading
        ? <Item>
          <div></div>
          {Array.from(Array(3).keys()).map((i) => <Column key={i} className={"placeholder-wave"}><span className={"placeholder col-md-8 col-12"}></span></Column>)}
          <div></div>
        </Item >
        : (//<Link href={`/usuarios/${subRoute}/${user?.id}`} passHref><a>
          <Item>
            <CustomFormCheck
              inline
              name="users"
              value={user?.id.toString()}
              label={<CheckboxPreventClick onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} />}
              onClick={(e) => handleCheck(e)}
            />

            <Column>
              <OverlayTrigger placement="bottom" overlay={<Tooltip>{user?.name}</Tooltip>}>
                <span>{user?.name}</span>
              </OverlayTrigger>
            </Column>

            <Column>
              <OverlayTrigger placement="bottom" overlay={<Tooltip>{user?.email}</Tooltip>}>
                <span>{user?.email}</span>
              </OverlayTrigger>
            </Column>

            <Column>
              <OverlayTrigger placement="bottom" overlay={<Tooltip><BranchesColumnTooltip branches={user?.branches} /></Tooltip>}>
                <span>
                  {user?.branches[0]?.name
                    ? (<div className="text-with-ribbon">
                      <span>{user?.branches[0]?.name}</span>
                      {(user?.branches && user?.branches?.length > 1) &&
                        <Ribbon>+{user?.branches?.length - 1}</Ribbon>
                      }
                    </div>)
                    : "-"
                  }
                </span>
              </OverlayTrigger>
            </Column>

            <Column>
              <UserStatus status={user?.isActive}>{user?.isActive === true ? "Ativo" : "Inativo"}</UserStatus>
            </Column>

            {user?.isActive === true &&
              <Dropdown align="end" onClick={(e) => handleDropdown(e)} onMouseLeave={() => setConfirmDeletion(false)}>
                <Options variant="secondary">
                  <i className="bi bi-three-dots-vertical" />
                </Options>

                <DropdownMenu renderOnMount={true}>
                  <DropdownItem onClick={() => /*setShowModalEdit(true)*/ { }} accent={"var(--success)"}>
                    <i className="bi bi-pencil-fill"></i> Editar
                  </DropdownItem>
                  <DropdownItem onClick={() => /*setShowModalEdit(true)*/ { }} accent={"var(--success)"}>
                    <i className="bi bi-key-fill"></i> Resetar senha
                  </DropdownItem>
                  <DropdownItem onClick={(e) => handleDeletion(e)} accent={"var(--danger)"}>
                    {confirmDeletion
                      ? fetchingDelete ? <Spinner size={"21px"} color={"var(--danger)"} /> : <><i className="bi bi-exclamation-circle-fill"></i> Confirmar</>
                      : <><i className="bi bi-trash-fill"></i> Desativar</>
                    }
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            }
          </Item >
        )
  );
}