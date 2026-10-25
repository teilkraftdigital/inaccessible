import "./style.css";

document.addEventListener("keydown", function (e) {
  e.preventDefault();
});

function removeA11y() {
  if ("pointerEvents" in document.body.style) {
    console.log("pointer-events supported");
    return;
  }

  document.addEventListener("click", function (e) {
    e.preventDefault();
  });
}

removeA11y();
