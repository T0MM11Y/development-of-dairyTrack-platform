import Swal from "sweetalert2";

const showAlert = ({ type, title, text, timer = 1500, showConfirmButton = false }) => {
  return Swal.fire({
    icon: type,
    title,
    text,
    timer,
    showConfirmButton,
  });
};

const showConfirmAlert = ({ title, text, confirmButtonText = "Yes", cancelButtonText = "No" }) => {
  return Swal.fire({
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
  });
};

export { showAlert, showConfirmAlert };