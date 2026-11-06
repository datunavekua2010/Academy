import { StrictMode, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { StudentApp } from "./student/StudentApp";
import { isStudentPath, useHashRoute } from "./router";

function Shell() {
  const path = useHashRoute();
  const studentArea = isStudentPath(path);
  const previous = useRef(studentArea);

  // Reset scroll only when crossing between the public site and the student
  // area — the landing page's own #section anchors must keep working.
  useEffect(() => {
    if (previous.current !== studentArea) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      previous.current = studentArea;
    }
  }, [studentArea]);

  useEffect(() => {
    if (!studentArea) document.title = 'Axiom Academy — მათემატიკა და ლოგიკა';
  }, [studentArea]);

  return studentArea ? <StudentApp /> : <App />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Shell />
  </StrictMode>
);
