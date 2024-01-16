// custom page
const customForm = document.querySelector(".custom");
const title = document.querySelector(".custom>.title");
const ipAddress = document.querySelector(".custom>.ipAddress");
const port = document.querySelector(".custom>.port");
const btn = document.querySelector(".custom>.btn");

btn &&
  btn.addEventListener("click", () => {
    if (title.value == "" || ipAddress.value == "" || port.value == "") {
      fireToast(`All Fields are required`, "error");
      return;
    }else{
      handleSubmission();
    }
  });
function handleSubmission(e) {
  console.log("form submitted");

  // e.preventDefault();
  proxy.proxyListAdd({
    title: title.value,
    ipAddress: ipAddress.value,
    port: port.value,
  });
  ipcRenderer.send("custom-form:accepted", {
    msg: `Proxy data added`,
  });
  fireToast(
    `Added Proxyserver : http://${ipAddress.value}:${port.value}`,
    "success"
  );

  (title.value = ""), (ipAddress.value = ""), (port.value = "");
}

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
