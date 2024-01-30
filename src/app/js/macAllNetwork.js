// custom page
const addSudo = document.querySelector(".addSudo");
const sudo = document.querySelector(".addSudo .sudo");
const btn = document.querySelector(".addSudo>.btn");

const initialVal = localStorage.getItem("proxyManagerSudo");
console.log({ initialVal });
console.log(sudo.value);
if (initialVal !== null) sudo.checked = true;
else sudo.checked = false;

sudo &&
  sudo.addEventListener("change", () => {
    handleSubmission();
    // sudo.value = !sudo.value;
  });

function handleSubmission(e) {
  console.log("sudo submitted");
  console.log(sudo.checked);
  try {
    const val = localStorage.getItem("proxyManagerSudo");
    if (val !== null) {
      localStorage.removeItem("proxyManagerSudo");
      fireToast(`Afterwards Proxy will be applied to all networks`, "success");
    } else {
      localStorage.setItem("proxyManagerSudo", "Yes");
      fireToast(
        `Afterwards Proxy will be applied to only LAN and Wi-Fi`,
        "success"
      );
    }
  } catch (err) {
    fireToast(`Error : ${err}`, "error");
  }
  sudo.value = "";
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
