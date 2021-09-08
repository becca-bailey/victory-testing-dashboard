import {withUrqlClient} from "next-urql";

function MyApp({Component, pageProps}) {
  return <Component {...pageProps} />;
}

export default withUrqlClient(() => ({
  url: "/api/graphql",
}))(MyApp);
