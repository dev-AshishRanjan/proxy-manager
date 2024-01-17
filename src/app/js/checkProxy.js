const checkBtn = document.querySelector(".checkBtn");
const result = document.querySelector(".result");

var currentProxy;
function handleClick() {
  result.style.transform = "translateY(-100%)";
  checkBtn.style.animation = " 1.5s pulse infinite ease-in-out";
  checkBtn.innerText = "checking";
  setTimeout(() => {
    ipcRenderer.send("proxy:check", {});
  }, 2500);
  setTimeout(() => {
    result.style.transform = "translateY(1rem)";
    result.innerHTML =
      currentProxy === undefined
        ? `current system proxy : <span>${"No Proxy"}</span>`
        : `current system proxy  <span>${currentProxy}</span>`;
    checkBtn.style.animation = "none";
  }, 5000);
}

checkBtn.addEventListener("click", handleClick);
function fireToast(message, type = info) {
  Toastify.toast({
    text: message,
    duration: 5000,
    className: `${type} toast`,
    close: false,
    stopOnFocus: true,
    gravity: "bottom", // `top` or `bottom`
    position: "left",
  });
}

window.ipcRenderer.on("proxy:check:error", (e, options) => {
  console.log({ e });
  fireToast("system proxy check failure", "error");
});
window.ipcRenderer.on("proxy:check:success", (e, options) => {
  console.log({ e });
  currentProxy = e.proxy;
  fireToast("system proxy check success", "success");
});
