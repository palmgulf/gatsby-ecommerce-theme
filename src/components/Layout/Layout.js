import React from 'react';
import loadable from '@loadable/component';

import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
// import MiniCart from '../MiniCart';
import Header from '../Header';
import Footer from '../Footer';
import * as styles from './Layout.module.css';
// CSS not modular here to provide global styles
import './Globals.css';

const MiniCart = loadable(() => import('../MiniCart'), { ssr: false });

const Layout = ({ props, children, disablePaddingBottom = false, disableMiniCart = false }) => {
  return (
    <>
      <Helmet>
        {/* Add any sitewide scripts here */}
        <link
          rel="stylesheet"
          type="text/css"
          href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css"
        />
        <link
          rel="stylesheet"
          type="text/css"
          charset="UTF-8"
          href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css"
        />
      </Helmet>

      <Header />
      {/* {!disableMiniCart && <MiniCart />} ✅ Conditional */}
      <main
        className={`${styles.main} ${
          disablePaddingBottom === true ? styles.disablePaddingBottom : ''
        }`}
      >
        {children}
      </main>
      <Footer />
    </>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
