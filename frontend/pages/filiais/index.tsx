import { useState, useEffect } from "react";
import Head from "next/head";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import { useBreadcrumb } from "contexts/BreadcrumbContext";
import axios, { AxiosRequestConfig } from "axios";
import { toast } from "react-toastify";

// Shared
import Wrapper from "components/shared/Wrapper";
import Spinner from "components/shared/Spinner";

// Custom
import Branches from "components/pages/Filiais/Branches";

// Interfaces
import { IRootState } from "redux/store";
import IUserLogged from "interfaces/IUserLogged";
import { restrictPageForAdmin } from "utils";

export default function Filiais() {
  const router = useRouter();
  const user = useSelector<IRootState, IUserLogged>(state => state.user);
  const [loaded, setLoaded] = useState(false);
  const { setLinks } = useBreadcrumb();

  // Setting links used in breadcrumb
  useEffect(() => {
    const url = router.asPath;
    if (!url.includes("page") || !url.includes("search")) {
      router.replace(`${url.split("?")[0]}?page=1&search=`);
    }

    setLinks([
      {
        title: "Filiais",
      },
    ]);
  }, []);

  // Verifying user
  useEffect(() => {
    restrictPageForAdmin(user, router, setLoaded);
  }, [user]);

  // Branches
  const [branches, setBranches] = useState<any[]>([]);
  const [fetchingBranches, setFetchingBranches] = useState<boolean>(true);

  // Fetching branches
  const [page, setPage] = useState<number>(router.query.page ? parseInt(router.query.page as string) : 1);
  const [search, setSearch] = useState<string>(router.query.search ? router.query.search as string : "");

  const [totalPages, setTotalPages] = useState<number>(0);

  useEffect(() => {
    const _page = parseInt(router.query.page as string);
    const _search = router.query.search as string;

    if (_page !== undefined && _search !== undefined) {
      setPage(_page);
      setSearch(_search);

      fetchBranches(_page, _search);
    }
  }, [router]);

  async function fetchBranches(_page, _search) {
    setFetchingBranches(true);

    const options = {
      url: `${process.env.api}/branches?page=${_page}&limit=16&search=${_search}`,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${user.token}`,
      },
    };

    await axios
      .request(options as AxiosRequestConfig)
      .then((response) => {
        setBranches(response.data.branches);
        setTotalPages(response.data.totalPages);
      })
      .catch((error) => {
        const errorMessages = {
          0: "Oops, tivemos um erro. Tente novamente.",
          500: error?.response?.data?.message,
        };

        const code = error?.response?.status ? error.response.status : 500;
        toast.error(code in errorMessages ? errorMessages[code] : errorMessages[0]);
      });

    setFetchingBranches(false);
  }

  return (
    <>
      <Head>
        <title>Filiais - {process.env.title}</title>
      </Head>

      {loaded ? (
        <Wrapper>
          <Branches
            branches={branches}
            loading={fetchingBranches}
            totalPages={totalPages}

            onChange={() => fetchBranches(page, search)}
          />
        </Wrapper>
      ) : (
        <div
          style={{
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Spinner size={"30px"} color={"var(--primary-color)"} />
        </div>
      )}
    </>
  );
}
