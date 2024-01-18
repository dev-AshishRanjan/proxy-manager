// custom page
const addSudo = document.querySelector(".addSudo");
const sudo = document.querySelector(".addSudo>.sudo");
const btn = document.querySelector(".addSudo>.btn");

btn &&
  btn.addEventListener("click", () => {
    if (sudo.value == "") {
      fireToast(`All Fields are required`, "error");
      return;
    } else {
      handleSubmission();
    }
  });
function handleSubmission(e) {
  console.log("sudo submitted");
  console.log(sudo.value);
  try {
    localStorage.setItem("proxyManagerSudo", sudo.value);
    fireToast(`Added sudo password in localstorage`, "success");
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
