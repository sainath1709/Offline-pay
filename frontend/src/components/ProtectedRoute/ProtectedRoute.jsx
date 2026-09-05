// installHook.js:1 Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
// 1. You might have mismatching versions of React and the renderer (such as React DOM)
// 2. You might be breaking the Rules of Hooks
// 3. You might have more than one copy of React in the same app
// See https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem.
// overrideMethod @ installHook.js:1
// react.js?v=12db1143:706 Uncaught TypeError: Cannot read properties of null (reading 'useContext')
//     at exports.useContext (react.js?v=12db1143:706:22)
//     at useNavigate (react-router-dom.js?v=12db1143:3947:37)
//     at Login.jsx:6:18

import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;