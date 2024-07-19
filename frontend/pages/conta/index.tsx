import { useState, useEffect } from "react";
import Head from "next/head";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import { useBreadcrumb } from "contexts/BreadcrumbContext";

// Shared
import Wrapper from "components/shared/Wrapper";
import Spinner from "components/shared/Spinner";
import { DefaultWrapper } from "components/shared/Wrapper/styles";
import { H3 } from "components/shared/Titles";

// Custom
import AccountMenu from "components/pages/Conta/AccountMenu";

// Interfaces
import { IRootState } from "redux/store";
import IUserLogged from "interfaces/IUserLogged";
import { restrictPageForLoggedUsers } from "utils";

export default function NovoUsuario() {
  const router = useRouter();
  const user = useSelector<IRootState, IUserLogged>((state) => state.user);
  const [loaded, setLoaded] = useState(false);
  const { setLinks } = useBreadcrumb();

  // Setting links used in breadcrumb
  useEffect(() => {
    setLinks([
      { title: "Minha conta" },
    ]);
  }, []);

  // Verifying user
  useEffect(() => {
    restrictPageForLoggedUsers(user, router, setLoaded);
  }, [user]);

  return (
    <>
      <Head>
        <title>Minha conta - {process.env.title}</title>
      </Head>

      {loaded
        ? <Wrapper>
          <DefaultWrapper>
            <H3 >Minha conta</H3>

            <AccountMenu user={user} />
          </DefaultWrapper>
        </Wrapper>
        : <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Spinner size={"30px"} color={"var(--primary-color)"} />
        </div>
      }
    </>
  );
}