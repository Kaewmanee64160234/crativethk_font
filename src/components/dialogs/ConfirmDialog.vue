<script setup lang="ts">

import Swal from "sweetalert2";
import { ref, defineExpose } from "vue";
const sweet = ref(false);
const detail = ref("");
const title = ref("");
const agree = ref("Agree");

const cancel = ref("Cancel");
let onOk: (value:unknown) => void;
let onCancel: (value:unknown) => void;
const cancelBtn = () => {
  try{
    sweet.value = false;
  onCancel("cancel");
  }catch(e){
    console.log(e);
  }

}
const okBtn = () => {
  sweet.value = false;
  onOk("Ok");
}

// const openDialog = (
//   title_: string,
//   desc: string,
//   okBtn: string,
//   cancel_: string
// ) => {
//   title.value = title_;
//   detail.value = desc;
//   agree.value = okBtn;
//   cancel.value = cancel_;
//   sweet.value = true;
//   return new Promise((resolve, reject) => {
//     onOk = resolve;
//     onCancel = reject;
//   });
// };
// defineExpose({ openDialog });

const openDialog = (title: string, desc: string, okBtn: string, cancel: string) => {
  return Swal.fire({
    title: title,
    text: desc,
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: okBtn,
    cancelButtonText: cancel,
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire(
      'Done!',
      'Everything done.',
      'success'
    )
      return Promise.resolve();
    } else if (result.isDismissed) {
      return Promise.reject();
    }
  });
};

defineExpose({ openDialog });
</script>
<template>

  <v-dialog v-model="sweet" style="z-index: 99999999; ">
    <v-card class="mx-auto" max-width="344">
      <v-card-item>
        <div>
          <div class="text-overline mb-1">{{ title }}</div>
          <div class="text-h7 mb-1">{{ detail }} </div>
        </div>
      </v-card-item>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="secondary"  @click="okBtn">
          {{ agree }}
        </v-btn>
        <v-btn color="red"  @click="cancelBtn"> {{ cancel }} </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

