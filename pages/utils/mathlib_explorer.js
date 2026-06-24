'use client'

import Head from 'next/head';
import Navbar from '../navbar';

export default function MathlibExplorer() {
  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>Mathlib Explorer - Chestnut-24</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />
      <main className="flex-grow">
        <div className="min-h-full">
          <iframe
            src="https://mle.trance-0.com"
            title="Mathlib Explorer"
            className="w-full border-0"
            style={{ height: 'calc(100vh - 70px)' }}
          />
        </div>
      </main>
    </div>
  );
}
