const settingsForm = document.querySelector("#settings-form");
let autoUpdate = true;
let curEmbedCode;

const objToQueryString = (obj) => {
  var str = [];
  for (var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  return str.join("&");
};

const getSettings = () => {
  const formData = new FormData(settingsForm);
  const settings = {};
  for (const [key, value] of formData) {
    settings[key] = value;
  }
  return settings;
};

const generateEmbedCode = () => {
  const settings = getSettings();
  console.log("settings", settings);
  const queryString = objToQueryString(settings);
  const src = `http://localhost:3000/price-widget-v2?${queryString.trim()}`;
  let embedCode = `<iframe src="${src}"/>`;
  curEmbedCode = embedCode;
  return [src, embedCode];
};

const update = () => {
  const [src, embedCode] = generateEmbedCode();
  const codeBlock = document.querySelector("#code-block");
  codeBlock.innerText = embedCode;
  hljs.highlightAll();

  console.log("src", src);
  document.querySelector("#preview-frame").src = src;
};

[
  ...document.querySelectorAll("input"),
  ...document.querySelectorAll("select"),
].forEach((input) => {
  if (settingsForm.contains(input)) {
    input.addEventListener("change", () => {
      if (autoUpdate) {
        update();
      }
    });
  }
});

update();

document
  .querySelector("#product-url-input")
  .addEventListener("focusout", (e) => {
    const encodedProductUrl = encodeURIComponent(e.target.value);
    fetch(
      "http://localhost:3000/validate-product-url?url=" + encodedProductUrl
    ).then(async (response) => {
      const validateUrlResult = await response.json();
      if (validateUrlResult.success) {
        e.target.classList.add("uk-form-success");
      } else {
        e.target.classList.add("uk-form-danger");
      }
    });
  });

document
  .querySelector("#reset-settings-button")
  .addEventListener("click", () => {
    settingsForm.reset();
    document
      .querySelector("#product-url-input")
      .classList.remove("uk-form-success", "uk-form-danger");
    setTimeout(() => {
      update();
    }, 50);
  });

document.querySelector("#auto-update-input").addEventListener("change", (e) => {
  autoUpdate = e.target.checked;
});

document.querySelector("#generate-button").addEventListener("click", () => {
  update();
});

document.querySelector("#copy-button").addEventListener("click", () => {
  navigator.clipboard.writeText(curEmbedCode);
  UIkit.notification({
    message: "Copied to clipboard!",
    status: "success",
    pos: "top-center",
    timeout: 5000,
  });
});
