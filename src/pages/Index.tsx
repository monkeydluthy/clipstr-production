import { redirect } from "react-router-dom";

const Index = () => {
  // Redirect to home page since we have a dedicated HomePage component now
  window.location.href = "/";
  return null;
};

export default Index;
