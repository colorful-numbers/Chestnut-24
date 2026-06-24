

'use client'

import Head from 'next/head';
import Navbar from './navbar';
import Footer from './footer';

export default function Privacy() {
    return (
        <div className="min-h-screen flex flex-col">
            <Head>
                <title>Privacy Policy - Chestnut-24</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Navbar />
            <main className="flex-grow">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="rounded-lg shadow-md p-6 mb-6">
                            <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

                            <div className="prose prose-lg max-w-none">
                                <p className="text-gray-600 mb-6">
                                    Last updated: 2025-08-17
                                </p>

                                <section className="mb-8">
                                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Information We Collect</h2>
                                    <p className="text-gray-700 mb-4">
                                        We collect (we define collect as storing any of your inputs outside of your local machine) <strong>absolutely no information</strong> from you. User-facing preferences and tool data are stored locally in your browser where possible.
                                    </p>
                                </section>

                                <section className="mb-8">
                                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact Us</h2>
                                    <p className="text-gray-700 mb-4">
                                        If you have any questions about this Privacy Policy, use the project channel where this site is maintained.
                                    </p>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
