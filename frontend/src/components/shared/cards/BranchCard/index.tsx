import { useState } from "react";
import { Dropdown } from "react-bootstrap";
import Link from "next/link";

// Shared
import { H4 } from "components/shared/Titles";
import toggleModalForm from "components/shared/ModalForm";
import FormEditBranch from "components/shared/forms/FormAddBranch";

// Custom
import {
  Wrapper,
  HoverMenu,
  DropdownMenu,
  DropdownItem,
  Options,
  Marker,
} from "./styles";

// Interfaces
import IBranch from "interfaces/IBranch";

interface IBranchCard {
  branch: IBranch;
  link?: string;
  editable?: boolean;
  marked?: boolean;
  blurred?: boolean;

  onDelete?: Function;
  onChange?: Function;

  children?: React.ReactNode;
}

export default function BranchCard({
  branch,
  link,
  editable = true,
  marked = false,
  blurred = false,

  onDelete = () => { },
  onChange = () => { },

  children,
}: IBranchCard) {
  function handleDropdown(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function CardBody({ branch, marked, blurred }: IBranchCard) {
    const [confirmDeletion, setConfirmDeletion] = useState<boolean>(false);

    function handleDeletion(e) {
      e.preventDefault();
      e.stopPropagation();
      setConfirmDeletion(!confirmDeletion);

      if (confirmDeletion) {
        onDelete();
      }
    }

    return (
      <Wrapper marked={marked} blurred={blurred}>
        <div>
          <H4>{branch.name}</H4>
          <span>
            {branch.userCount && branch.userCount > 0
              ? `${branch.userCount} alunos`
              : "Sem alunos"
            }
          </span>
        </div>
        {/*<p>Código: {branch?.code}</p>
        <p>Períodos: {branch?.periods}</p>*/}

        {children}

        {branch.id && editable && (
          <HoverMenu onMouseLeave={() => setConfirmDeletion(false)}>
            <Dropdown align="end" onClick={(e) => handleDropdown(e)}>
              <Options variant="secondary">
                <i className="bi bi-gear-fill" />
              </Options>

              <DropdownMenu renderOnMount={true}>
                <DropdownItem
                  onClick={() =>
                    toggleModalForm(
                      `Editar curso (${branch.name})`,
                      <FormEditBranch branch={branch} onChange={onChange} />,
                      "md"
                    )
                  }
                  accent={"var(--success)"}>
                  <i className="bi bi-pencil-fill"></i> Editar
                </DropdownItem>
                <DropdownItem
                  onClick={(e) => handleDeletion(e)}
                  accent={"var(--danger)"}>
                  {confirmDeletion ? (
                    <>
                      <i className="bi bi-exclamation-circle-fill"></i>{" "}
                      Confirmar
                    </>
                  ) : (
                    <>
                      <i className="bi bi-trash-fill"></i> Remover
                    </>
                  )}
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </HoverMenu>
        )}

        {marked && (
          <Marker>
            <i className="bi bi-check2" />
          </Marker>
        )}
      </Wrapper>
    );
  }

  return link ? (
    <Link href={link}>
      <a>
        <CardBody branch={branch} marked={marked} blurred={blurred} />
      </a>
    </Link>
  ) : (
    <CardBody branch={branch} marked={marked} blurred={blurred} />
  );
}
