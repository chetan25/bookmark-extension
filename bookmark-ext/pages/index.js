import React from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';

const Bookmarks = dynamic(() => import('../components/bookmarks'), { ssr: false });

const Home = () => {

    return (
        <div>
            <Head>
                <title>Bookmarks</title>
            </Head>
            <Bookmarks/>
        </div>
    );
};

export default Home
