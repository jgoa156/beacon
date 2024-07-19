import { useState, useEffect } from "react";
import Head from "next/head";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";

// Shared
import Wrapper from "components/shared/Wrapper";
import Spinner from "components/shared/Spinner";

// Custom
import BranchSelector from "components/pages/Filial/BranchSelector";

// Interfaces
import { IRootState } from "redux/store";
import IUserLogged from "interfaces/IUserLogged";
import { restrictPageForUsersWithoutSelectedBranch } from "utils";

export default function Filial() {
  const router = useRouter();
  const user = useSelector<IRootState, IUserLogged>(state => state.user);
  const [loaded, setLoaded] = useState(false);

  // Verifying user
  useEffect(() => {
    restrictPageForUsersWithoutSelectedBranch(user, router, setLoaded);
  }, [user]);

  return (
    <>
      <Head>
        <title>Filial - {process.env.title}</title>
      </Head>

      {loaded
        ? <Wrapper centerAlign={true} maxWidth={1024}>
          <BranchSelector />
        </Wrapper>
        : <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Spinner size={"30px"} color={"var(--primary-color)"} />
        </div>
      }
    </>
  );
}