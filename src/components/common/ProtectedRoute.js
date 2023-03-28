import React from "react";
import { Route, Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import Cookies from "js-cookie";

const ProtectedRoute = ({ element: Comp, path, ...rest }) => {
  function isLoggedIn() {
    return Cookies.get(`picgen`);
  }

  function getComponent() {
    return isLoggedIn() ? (
      <Comp />
    ) : (
      <Navigate
        to={{
          pathname: "../",
        }}
      />
    );
  }

  return <Route path={path} {...rest} element={getComponent()} />;
};

ProtectedRoute.propTypes = {
  path: PropTypes.string,
  element: PropTypes.func.isRequired,
};

export default ProtectedRoute;
