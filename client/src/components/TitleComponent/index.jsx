import React from 'react';
import Helmet from 'react-helmet';

const TitleComponent = ({ title }) => {
  const defaultTitle = 'Library';

  return (
    <Helmet>
      <title>{title || defaultTitle}</title>
    </Helmet>
  );
};

export default TitleComponent;
