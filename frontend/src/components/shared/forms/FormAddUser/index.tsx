import { useState, useEffect } from "react";
import axios, { AxiosRequestConfig } from "axios";
import { useRouter } from "next/router";
import { getToken, validateCpf, validateEmail, slugify } from "utils";

// Shared
import {
  FormAlert,
  MultiField,
  SectionTitle,
} from "components/shared/Form/styles";
import TextInput from "components/shared/TextInput";
import { Button } from "components/shared/Button";
import Spinner from "components/shared/Spinner";
import { H3 } from "components/shared/Titles";
import SelectCustom from "components/shared/SelectCustom";
import { DefaultWrapper } from "components/shared/Wrapper/styles";
import { toast } from "react-toastify";

// Custom
import { CustomForm, FormSection } from "./styles";
import UserTypeSelect from "./UserTypeSelect";

export default function FormAddUser() {
  const userTypeSlugs = ["", "administrador", "funcionario"];
  const router = useRouter();

  // Inputs and validators
  const [userTypeId, setUserTypeId] = useState<number | null>(router.query.tipo ? userTypeSlugs.indexOf(slugify(router.query.tipo.toString())) : null);
  const [selectKey, setSelectKey] = useState<number>(0);

  const [name, setName] = useState<string>("");
  const handleName = (value) => {
    setName(value);
  };

  const [email, setEmail] = useState<string>("");
  const handleEmail = (value) => {
    setEmail(value);
  };

  // Institutional info
  const [branches, setBranches] = useState<any[]>([]);
  const [fetchingBranches, setFetchingBranches] = useState<boolean>(true);
  async function fetchBranches(search = "") {
    setFetchingBranches(true);

    const options = {
      url: `${process.env.api}/branches?search=${search}`,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`,
      },
    };

    await axios
      .request(options as AxiosRequestConfig)
      .then((response) => {
        setBranches(response.data.branches);
        setSuccess(true);
      })
      .catch((error) => {
        const errorMessages = {
          0: "Oops, tivemos um erro. Tente novamente.",
          500: error?.response?.data?.message,
        };

        const code = error?.response?.status ? error.response.status : 500;
        setError(
          code in errorMessages ? errorMessages[code] : errorMessages[0]
        );
        setSuccess(false);
      });

    setFetchingBranches(false);
  }

  const [branchSearch, setBranchSearch] = useState<string>("");
  const handleBranchSearch = (value) => {
    setBranchSearch(value);
  };

  useEffect(() => {
    setFetchingBranches(true);
    const debounce = setTimeout(() => {
      fetchBranches(branchSearch);
    }, 1000);

    return () => clearTimeout(debounce);
  }, [branchSearch]);

  const [branchesMulti, setBranchesMulti] = useState<number[]>([]);
  const handleBranchesMulti = (value) => {
    setBranchesMulti(value);
  };

  // Resetting SelectCustom when user type changes
  useEffect(() => {
    setSelectKey(selectKey + 1);
    setBranchesMulti([]);
    setBranchSearch("");
  }, [userTypeId]); 819692

  // Form state
  const [sent, setSent] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [fetching, setFetching] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  function setDefaultState() {
    setSelectKey(selectKey + 1);

    setName("");
    setEmail("");
    setBranchesMulti([]);
    setBranchSearch("");

    setSent(false);
    setSuccess(false);
    setFetching(false);
    setError("");
  }

  function handleAddUser(e) {
    e.preventDefault();
    setSent(true);

    if (
      name.length != 0 &&
      validateEmail(email) &&
      (userTypeId !== 3 && branchesMulti.length != 0)
    ) {
      fetchAddUser({
        name,
        email,
        userType: ["", "Administrador", "Funcionário"][userTypeId ? userTypeId : 0],
        branchesIds: branchesMulti,
      });
    }
  }

  async function fetchAddUser(data) {
    setFetching(true);

    const options = {
      url: `${process.env.api}/users`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`,
      },
      data: data,
    };

    await axios
      .request(options as AxiosRequestConfig)
      .then((response) => {
        setSuccess(true);
        toast.success("Usuário adicionado com sucesso.");
        setDefaultState();
      })
      .catch((error) => {
        const badRequestMessages = {
          "Email already in use": "Email já cadastrado.",
          "Branch not found": "Filial não encontrada.",
        };

        const errorMessages = {
          0: "Oops, tivemos um erro. Tente novamente.",
          400: badRequestMessages[error?.response?.data?.message],
          403: "Recurso não disponível",
          500: error?.response?.data?.message,
        };

        const code = error?.response?.status ? error.response.status : 500;
        setError(
          code in errorMessages ? errorMessages[code] : errorMessages[0]
        );

        setSuccess(false);
      });

    setFetching(false);
  }

  return (
    <DefaultWrapper>
      <CustomForm>
        <H3 style={{ marginBottom: 35 }}>Adicionar usuário</H3>

        <UserTypeSelect
          userTypeId={userTypeId}
          setUserTypeId={setUserTypeId}
        />

        {userTypeId &&
          <FormSection>
            <SectionTitle>
              <b>1.</b> Informações pessoais
            </SectionTitle>

            <TextInput
              label={"Nome completo*"}
              name={"name"}
              id={"name"}
              value={name}
              handleValue={handleName}
              required={true}
              displayAlert={sent}
              maxLength={255}
            />

            <TextInput
              label={"Email*"}
              name={"email"}
              value={email}
              handleValue={handleEmail}
              validate={validateEmail}
              required={true}
              alert={"Email inválido"}
              displayAlert={sent}
              maxLength={255}
            />

            <SectionTitle>
              <b>2.</b> Filiais vinculadas ao usuário
            </SectionTitle>

            <SelectCustom
              key={selectKey}
              label={"Filiais*"}
              name={"branches"}
              inputValue={branchSearch}
              onInputChange={(value) => handleBranchSearch(value)}
              value={branchesMulti}
              handleValue={handleBranchesMulti}
              options={branches.map((branch) => {
                return {
                  value: branch.id,
                  label: branch.name,
                };
              })}
              required={true}
              displayAlert={sent}
              fetching={fetchingBranches}
              noOptionsMessage={"Nenhuma filial encontrada"}
              isMulti={true}
            />

            <Button style={{ marginTop: 15 }} onClick={(e) => handleAddUser(e)}>
              {fetching ? (
                <Spinner size={"20px"} color={"var(--white-1)"} />
              ) : (
                <>
                  <i className="bi bi-check2-all" />
                  Adicionar
                </>
              )}
            </Button>

            <>
              {sent && !success && error?.length != 0 && (
                <FormAlert>{error}</FormAlert>
              )}
            </>
          </FormSection>
        }
      </CustomForm>
    </DefaultWrapper>
  );
}
