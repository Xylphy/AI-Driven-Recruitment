"use client";

import Navbar from "../common/Navbar";
import Loading from "../common/Loading";
import Footer from "../common/Footer";
import { Suspense } from "react";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // <ApolloProvider client={client}>
    <>
      <Navbar />
      <Suspense fallback={<Loading />}>{children}</Suspense>
      <Footer />
    </>
    // </ApolloProvider>
  );
}
