document.querySelectorAll("label.uk-form-label").forEach((label) => {
  const targetInput = document.querySelector("#" + label.getAttribute("for"));
  const origText = label.innerText;
  const unit = targetInput.getAttribute("unit");
  if (targetInput.classList.contains("uk-range")) {
    label.innerText = `${origText} (${targetInput.value + (unit ? unit : "")})`;
    targetInput.addEventListener("input", () => {
      label.innerText = `${origText} (${
        targetInput.value + (unit ? unit : "")
      })`;
    });
  }
});
