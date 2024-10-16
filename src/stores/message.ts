import { ref } from "vue";
import { defineStore } from "pinia";
import Swal from 'sweetalert2';

export enum DialogType {
  info,
  error,
  confirm,
}
export const useMessageStore = defineStore("message", () => {
  const isShow = ref(false);
  const message = ref("");
  const type = ref<DialogType>(DialogType.info);

  function CalshowError(text: string) {
    type.value = DialogType.error;
    message.value = text;
    isShow.value = true;
  }
  function showError(text: string) {

    Swal.fire({
      // iconHtml: '<span class="mdi mdi-bell-ring-outline mdi-48px"></span>',
      icon: "error",
      background: "white",
      iconColor: "red",
      color: "black",
      confirmButtonText: "Close",
      text: text,
    });
  }

  function showInfo(text: string) {
    Swal.fire({
      title: 'Success!',
      text: text,
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
    });
  }
  function showConfirm(text: string) {
    type.value = DialogType.confirm;
    message.value = text;
    isShow.value = true;
  }

  // hideMessage
  function hideMessage() {
    isShow.value = false;
  }
  
  function showConfirm_(text: string, onConfirm: () => void, onCancel?: () => void) {
    Swal.fire({
      text: text,
      html: `<span class="mdi mdi-bell-ring-outline" style="font-size: 100px; color: #CF0000;"></span><p><b>${text}</b></p>`,
      showCancelButton: true,
      cancelButtonText: 'ยกเลิก',
      confirmButtonText: 'ยืนยัน',
      confirmButtonColor: '#3051AC',
      cancelButtonColor: '#CF0000',
    }).then((result) => {
      if (result.isConfirmed) {
        onConfirm();
      } else if (result.isDismissed && onCancel) {
        onCancel();
      }
    });
  }
  return { isShow, message, showError, showInfo, CalshowError,showConfirm , showConfirm_, hideMessage};
});

