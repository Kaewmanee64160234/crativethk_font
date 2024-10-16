<script lang="ts" setup>
import { onMounted, ref, computed, reactive } from "vue";
import { useUserStore } from "@/stores/user.store";
import * as faceapi from "face-api.js";
import Swal from "sweetalert2";
import { useMessageStore } from "@/stores/message";
import Loader from "@/components/loader/Loader.vue";
import { useNotiforupdate } from "@/stores/notiforUpdate.store";

interface CanvasRefs {
  [key: number]: HTMLCanvasElement;
}


const messageStore = useMessageStore();
const isLoading = ref(false);
const userStore = useUserStore();
const showDialog = ref(true);
const showTeacherDialog = ref(false); // Added this line
const canvasRefs = reactive<CanvasRefs>({});
const url = import.meta.env.VITE_API_URL;

const imageUrls = ref<string[]>([]);
const imageFiles = ref<File[]>([]);
const fileInputKey = ref(Date.now());
// Key to reset the file input field
const faceDescriptionFields = ref<Float32Array[]>([]);
const notiStore = useNotiforupdate();
const selectedTeacher = ref(null);
interface Teacher {
  userId: number;
  firstName: string;
  lastName: string;
}
const teachers = ref<Teacher[]>([]);

// Fetching existing images from the user store
const images = ref<string[]>(
  userStore.currentUser?.images?.map(
    (image: string) => `${url}/users/image/filename/${image}`
  ) ?? []
);
async function close() {
  userStore.closeImageDialog();
}

onMounted(async () => {
  await loadModels();
  await userStore.getTeachers();
  // console.log("Users fetched:", userStore.users);
  await userStore.getUsersById(userStore.currentUser?.userId!);
  images.value =
    userStore.currentUser?.images?.map(
      (image: string) => `${url}/users/image/filename/${image}`
    ) ?? [];
  try {
    await userStore.getTeachers();
    userStore.teachers.forEach((teacher) => {
      teachers.value.push({
        userId: teacher.userId!,
        firstName: teacher.firstName!,
        lastName: teacher.lastName!,
      });
    });
  } catch (error) {
    console.error("Failed to fetch teachers:", error);
  }
});

async function loadModels() {
  try {
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
    ]);
    // userStore.users.forEach((user) => {
    //   const descriptors: Float32Array[] = [];
    //   const faceDescriptionFields = user.faceDescriptions || [];
    //   console.log("faceDescriptionFields", faceDescriptionFields);

    //   faceDescriptionFields.forEach((description, idx) => {
    //     if (description) {
    //       try {
    //         const float32Array = base64ToFloat32Array(description);
    //         descriptors.push(float32Array);
    //       } catch (error) {
    //         console.error(`Error decoding face description ${idx + 1} for user: ${user.email}`, error);
    //       }
    //     }
    //   });

    //   if (descriptors.length > 0) {
    //     userDescriptors.set(user.studentId!, descriptors);
    //   }
    // });
    console.timeEnd("Face Description Processing Time");
    const urls: string[] = JSON.parse(localStorage.getItem("images") || "[]");

    imageUrls.value = urls;
    localStorage.removeItem("images");

    console.time("Image Processing Time");
    await Promise.all(
      imageUrls.value.map((url, index) => loadImageAndProcess(url, index))
    );
    console.timeEnd("Image Processing Time");
  } catch (error) {
    console.error("Error loading face-api models:", error);
  }
}

// Compute selected teacher's name for confirmation step
const selectedTeacherName = computed(() => {
  if (selectedTeacher.value) {
    const teacher = teachers.value.find(
      (teacher) => teacher.userId === selectedTeacher.value
    );
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : "";
  }
  return "";
});

function selectTeacher(teacher: any) {
  selectedTeacher.value = teacher.userId;
}
function base64ToFloat32Array(base64: string | undefined): Float32Array {
  if (!base64) {
    console.error("base64 string is undefined or not provided");
    return new Float32Array(); // Return an empty array to safely handle this case
  }

  // Ensure the string contains the expected structure and split correctly
  const base64Data = base64.includes(",") ? base64.split(",")[1] : base64;
  try {
    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new Float32Array(bytes.buffer);
  } catch (error) {
    console.error("Error converting base64 to bytes:", error);
    return new Float32Array();
  }
}

function loadImageAndProcess(dataUrl: string, index: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = async () => {
      try {
        await processImage(img, index);
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = (error) => {
      console.error("Error loading image:", dataUrl, error);
      reject(error);
    };
    img.src = dataUrl;
  });
}

async function processImage(image: HTMLImageElement, index: number) {
  console.time(`Image Detection and Descriptor Time - Image ${index}`);
  const canvas = canvasRefs[index] || document.createElement("canvas");
  document.body.appendChild(canvas);
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  try {
    const detections = await faceapi
      .detectAllFaces(image)
      .withFaceLandmarks()
      .withFaceDescriptors();
    detections.forEach((detection) => {
      if (!detection.descriptor) {
        console.error("Descriptor is missing for the detected face");
        return; // Skip this iteration if the descriptor is not available
      }
     
    });
  } catch (error) {
    console.error("Failed to process face detection:", error);
  } finally {
    document.body.removeChild(canvas);
    console.timeEnd(`Image Detection and Descriptor Time - Image ${index}`);
  }


}



function float32ArrayToBase64(float32Array: Float32Array): string {
  const uint8Array = new Uint8Array(float32Array.buffer);
  const binaryString = String.fromCharCode.apply(
    null,
    (uint8Array as unknown) as number[]
  );
  return btoa(binaryString);
}

// resizeAndConvertToBase64
// async function resizeAndConvertToBase64(
//   imageUrl: string,
//   maxWidth: number,
//   maxHeight: number
// ): Promise<string> {
//   return new Promise<string>((resolve, reject) => {
//     const img = new Image();
//     img.crossOrigin = "Anonymous";
//     img.onload = () => {
//       const canvas = document.createElement("canvas");
//       const ctx = canvas.getContext("2d");
//       if (!ctx) return reject(new Error("Canvas context not available"));
//       // Calculate the aspect ratio and resize
//       const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
//       const width = img.width * ratio;
//       const height = img.height * ratio;

//       // Set canvas dimensions
//       canvas.width = width;
//       canvas.height = height;

//       // Draw the resized image onto the canvas
//       ctx.drawImage(img, 0, 0, width, height);

//       // Convert the canvas to a base64 string with the specified quality
//       const resizedImage = canvas.toDataURL("image/jpeg", 0.5);
//       resolve(resizedImage);
//     };
//     img.onerror = () => reject(new Error(`Failed to load image at ${imageUrl}`));
//     img.src = imageUrl;
//   });
// }
// base64ToBlob
// function base64ToBlob(base64: string, type: string): Blob {
//   const binaryString = atob(base64.split(",")[1]);
//   const len = binaryString.length;
//   const bytes = new Uint8Array(len);
//   for (let i = 0; i < len; i++) {
//     bytes[i] = binaryString.charCodeAt(i);
//   }
//   return new Blob([bytes], { type });
// }

// Function to calculate Euclidean distance between two face descriptors
function calculateEuclideanDistance(
  descriptor1: Float32Array,
  descriptor2: Float32Array
): number {
  console.log("descriptor1", descriptor1);
  console.log("descriptor2", descriptor2);

  if (!descriptor1 || !descriptor2) {
    console.error("One of the descriptors is undefined.");
    return -1; // Returning -1 or another error value to indicate failure
  }

  if (descriptor1.length !== descriptor2.length) {
    console.error(
      `Descriptor lengths are not equal. Descriptor1 length: ${descriptor1.length}, Descriptor2 length: ${descriptor2.length}`
    );
    return -1; // Handle this error case appropriately in your application logic
  }

  const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
  return distance;
}

async function saveUserUpdate() {
  if (canUpload.value) {
    isLoading.value = true;
    const processedImages = await Promise.all(
      imageFiles.value.map((file) =>
        resizeAndConvertImageToBase64(URL.createObjectURL(file), 800, 600, 0.7)
      )
    );

    const filesToUpload = processedImages.map((base64, index) =>
      base64ToFile(base64, `image-${index + 1}.jpg`)
    );

    for (const image of imageFiles.value) {
      const img = new Image();
      img.src = URL.createObjectURL(image);
      await new Promise<void>((resolve, reject) => {
        img.onload = async () => {
          try {
            const detection = await faceapi
              .detectSingleFace(img)
              .withFaceLandmarks()
              .withFaceDescriptor();
            if (detection) {
              faceDescriptionFields.value.push(detection.descriptor); // Store as Base64 string
            }
            resolve();
          } catch (error) {
            console.error("Face detection failed:", error);
            reject(error);
          }
        };
        img.onerror = (error) => {
          console.error("Error loading image:", error);
          reject(error);
        };
      });
    }
    // map base64Descriptor to base 64 in faceDescriptionsArray
    const faceDescriptionsArray = faceDescriptionFields.value.map((descriptor) =>
      float32ArrayToBase64(descriptor)
    );

    userStore.editUser = {
      ...userStore.currentUser,
      firstName: userStore.currentUser!.firstName || "",
      lastName: userStore.currentUser!.lastName || "",
      files: filesToUpload,
      faceDescriptions: faceDescriptionsArray,
      images: imageUrls.value,
    };

    // Uncomment these lines once the issue is resolved
    try {
      await userStore.saveUser();

      showDialog.value = false;
      messageStore.showInfo("อัปโหลดรูปภาพสำเร็จ");
      window.location.reload();
    } catch (error) {
      messageStore.showError("Failed to save user data.");
      console.error("Save error:", error);
    } finally {
      isLoading.value = false;
    }
  }
}
async function save() {
  if (userStore.currentUser?.registerStatus === "confirmed") {
    if (imageUrls.value && imageUrls.value.length > 0) {
      try {
        await notiStore.getNotiforupdateByLastId(userStore.currentUser?.userId + '');
        console.log("currentNotiforupdate", notiStore.currentNotiforupdate);



        if (notiStore.currentNotiforupdate?.statusconfirmation !== "pending") {
          await Promise.all(
            imageUrls.value.map((url, index) => loadImageAndProcess(url, index))
          );

          // Convert the user's latest image to a face descriptor
          const latestUserImage = images.value[0]; // Assuming the first image is the latest
          const croppedFaceDescriptor = await extractFaceDescriptorFromImage(
            latestUserImage
          );

          if (!croppedFaceDescriptor) {
            console.error("Failed to extract face descriptor from the latest user image.");
            messageStore.showError("Failed to extract face descriptor.");
            return;
          }
          // Convert user's saved face description from base64 string to Float32Array
          const userFaceDescriptionBase64 = userStore.currentUser?.faceDescriptions?.[0];
          const userFaceDescriptor = userFaceDescriptionBase64
            ? base64ToFloat32Array(userFaceDescriptionBase64)
            : null;
          if (!userFaceDescriptor || !croppedFaceDescriptor) {
            console.error("Failed to obtain face descriptors.");
            messageStore.showError("Failed to obtain face descriptors.");
            return;
          }

          console.log("User face descriptor (Float32Array):", userFaceDescriptor);
          console.log("Cropped face descriptor (Float32Array):", croppedFaceDescriptor);

          // Compare descriptors
          const distance = calculateEuclideanDistance(
            userFaceDescriptor,
            croppedFaceDescriptor
          );
          console.log("Distance:", distance < 0.4);

          if (distance > 0.4) {
            await saveUserUpdate();
            messageStore.showConfirm("อัปโหลดรูปภาพสำเร็จ");

            await userStore.getUsersById(userStore.currentUser?.userId!);
          } else if (selectedTeacherName.value == "" && userStore.currentUser?.registerStatus === "confirmed") {
            showDialog.value = true;
            showSnackbar("โปรดใส่ชื่ออาจารย์ที่ต้องการส่งรูปภาพ");
          } else {
            console.log("Face descriptors do not match.");
            await close();
            await Swal.fire({
              title: "รูปภาพไม่ตรงกับข้อมูล",
              text: "คุณต้องการส่งรูปภาพไปยังครูหรือไม่",
              icon: "warning",
              showCancelButton: true,
              confirmButtonText: "ส่ง",
              cancelButtonText: "ยกเลิก",
              allowOutsideClick: false,
            }).then(async (result) => {
              if (result.isConfirmed) {
                try {
                  const formData = new FormData();

                  // Detect faces and get descriptors for each image file
                  for (let i = 0; i < imageFiles.value.length; i++) {
                    const imageFile = imageFiles.value[i];
                    const img = new Image();
                    img.src = URL.createObjectURL(imageFile);

                    await new Promise<void>((resolve, reject) => {
                      img.onload = async () => {
                        try {
                          const detection = await faceapi
                            .detectSingleFace(img)
                            .withFaceLandmarks()
                            .withFaceDescriptor();
                          if (detection) {
                            const descriptor = detection.descriptor;
                            const base64Descriptor = float32ArrayToBase64(descriptor);

                            // Append face descriptor to formData
                            formData.append(`faceDescriptor${i + 1}`, base64Descriptor);
                            console.log("Appended face descriptor:", base64Descriptor);
                          } else {
                            console.warn(`No face detected in image ${i + 1}`);
                          }

                          // Append the image file to formData
                          formData.append("files", imageFile, imageFile.name);
                          console.log("Appended file:", imageFile.name);

                          resolve();
                        } catch (error) {
                          console.error("Face detection failed:", error);
                          reject(error);
                        }
                      };
                      img.onerror = (error) => {
                        console.error("Error loading image:", error);
                        reject(error);
                      };
                    });
                  }

                  // Add userId to formData
                  formData.append("userId", String(userStore.currentUser!.userId!));
                  console.log("Sending formData to create notification...");
                  await notiStore.createNotiforupdate(formData);
                  console.log("Notification created successfully.");

                  // Send an email to the selected teacher
                  if (selectedTeacher.value) {
                    const teacher = teachers.value.find(
                      (t) => t.userId === selectedTeacher.value
                    );
                    if (teacher) {
                      notiStore
                        .sendEmailToTeacher(
                          teacher.firstName,
                          teacher.lastName,
                          userStore?.currentUser!
                        )
                        .then(() => {
                          showSnackbar("อีเมลถูกส่งไปยังอาจารย์แล้ว", "success");
                        })
                        .catch((error) => {
                          console.error("Failed to send email:", error);
                          showSnackbar("การส่งอีเมลล้มเหลว", "error");
                        });
                    }
                  } else {
                    showSnackbar("กรุณาเลือกอาจารย์ที่ต้องการส่งรูปภาพ", "error");
                  }
                  Swal.fire("อัปโหลดรูปภาพสำเร็จ", "ระบบกำลังประมวลผลข้อมูล", "success");
                } catch (error) {
                  console.error("Failed to create notification:", error);
                  messageStore.showError("Failed to create notification.");
                }
              } else {
                showDialog.value = true;
              }
            });
          }
        } else {
          // show dialog and returnm
          // show snaak notification
          showDialog.value = true;
          showSnackbar("รอการตรวจสอบจากระบบเนื่องจากคุณกำลังรออนุมัติจากคำขอก่อนหน้านี้", "error");

        }

      } catch (error) {
        console.error("Error in save function:", error);
        messageStore.showError("An error occurred during the save process.");
      }
    } else {
      messageStore.showError("No images available to send.");
    }
  } else {
    if (userStore.currentUser!.registerStatus === "reConfirmed") {
      console.log("reConfirmed", userStore.currentUser!.registerStatus);
      userStore.currentUser!.registerStatus = "notConfirmed";
      await userStore.updateRegisterStatus(
        userStore.currentUser!.userId!,
        userStore.currentUser!
      );
    }

    await saveUserUpdate();
    await close();
  }
}

// Helper function to extract face descriptor from an image URL
async function extractFaceDescriptorFromImage(
  imageUrl: string
): Promise<Float32Array | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = async () => {
      try {
        const detection = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
        if (detection && detection.descriptor) {
          resolve(detection.descriptor);
        } else {
          resolve(null);
        }
      } catch (error) {
        console.error("Face detection failed for the image:", imageUrl, error);
        resolve(null);
      }
    };
    img.onerror = (error) => {
      console.error("Error loading image for face descriptor extraction:", error);
      resolve(null);
    };
    img.src = imageUrl;
  });
}

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement | null;
  if (input) {
    if (input.files && input.files.length > 0) {
      Array.from(input.files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const result = e.target?.result as string;
          if (result) {
            try {
              const resizedImage = await resizeAndConvertImageToBase64(result, 800, 600);

              // Check for duplicate images
              const isDuplicate = checkDuplicateImage(resizedImage);
              if (!isDuplicate) {
                imageUrls.value.push(resizedImage);
                imageFiles.value.push(file);
              }
            } catch (error) {
              console.error("Error resizing image:", error);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  }
};

const base64ToFile = (base64: string, filename: string): File => {
  const arr = base64.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
};

const resizeAndConvertImageToBase64 = (
  imageUrl: string,
  maxWidth: number = 400, // Reduced default maxWidth to 400px
  maxHeight: number = 400, // Reduced default maxHeight to 400px
  quality: number = 0.5 // Lowered quality to 0.5 for better compression
): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas context not available"));

      // Calculate the aspect ratio and resize
      const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
      const width = img.width * ratio;
      const height = img.height * ratio;

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw the resized image onto the canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Convert the canvas to a base64 string with the specified quality
      const resizedImage = canvas.toDataURL("image/jpeg", quality);
      resolve(resizedImage);
    };
    img.onerror = () => reject(new Error(`Failed to load image at ${imageUrl}`));
    img.src = imageUrl;
  });
};

function checkDuplicateImage(newImageBase64: string): boolean {
  // Check if the new image base64 string is already in the list
  return imageUrls.value.some((uploadedImage) => {
    const uploadedImageBase64 = uploadedImage.split(",")[1];
    return uploadedImageBase64 === newImageBase64.split(",")[1];
  });
}
const hasUploadedImages = computed(() => imageUrls.value.length > 0);

const canUpload = computed(() => imageFiles.value.length === 5);

const deleteImage = (index: number) => {
  imageUrls.value.splice(index, 1);
  imageFiles.value.splice(index, 1);
  fileInputKey.value = Date.now();
  // console.log("image", imageUrls.value)
};
const checkConfirmImage = () => {
  console.log("image", userStore.currentUser?.images);
  if (userStore.currentUser?.images?.length !== 0 && userStore.currentUser?.registerStatus === "notConfirmed") {
    console.log("ya1");
    return true;
  } else {
    console.log("ya2");
    return false;
  }
};

// confirmTeacherSelection
const confirmTeacherSelection = () => {
  if (selectedTeacher.value) {
    showTeacherDialog.value = false;
  } else {
    showSnackbar("กรุณาเลือกอาจารย์ที่ต้องการส่งรูปภาพ");
  }
};
// Snackbar state
const snackbarVisible = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref("error");
function showSnackbar(message: string, color: string = "error") {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbarVisible.value = true;
}
// clear selectedTeacherName
const clearSelectedTeacher = () => {
  selectedTeacher.value = null;
  showTeacherDialog.value = false;
};
const showTeacherSelection = computed(() => userStore.currentUser?.registerStatus === 'confirmed');
</script>

<template>
  <v-dialog v-model="showDialog" height="800" persistent>
    <v-card class="rounded-lg" outlined>
      <!-- Loader Overlay -->
      <div v-if="isLoading" class="loader-overlay">
        <Loader></Loader>
      </div>
      <v-card-title class="headline"> อัปโหลดรูปภาพ </v-card-title>
      <v-card-text>
        <v-row v-if="!canUpload" class="mt-2">
          <v-col cols="12" class="text-center">
            <v-alert class="mt-3" color="#D72626">
              <v-icon left size="30">mdi-information-outline</v-icon>
              กรุณาอัปโหลดรูปภาพให้ครบ 5 รูป โดยรูปภาพห้ามซ้ำกัน
            </v-alert>
          </v-col>
        </v-row>

        <!-- Existing Images -->
        <!-- {{ images }} -->
        <v-row>
          <v-col v-for="(image, index) in images" :key="'existing-' + index" cols="2" md="2" lg="2"
            class="image-container">
            <v-img :src="image" aspect-ratio="1" class="rounded-lg d-flex align-center justify-center"></v-img>
          </v-col>
        </v-row>

        <!-- Uploaded Images -->
        <v-row v-if="hasUploadedImages" class="mt-4">
          <v-col cols="12">
            <v-text class="font-weight-bold">รูปภาพที่อัปโหลด</v-text>
          </v-col>
          <v-col v-for="(image, index) in imageUrls" :key="'uploaded-' + index" cols="2" md="2" lg="2"
            class="image-container">
            <v-img :src="image" aspect-ratio="1" class="rounded-lg ma-2 d-flex align-center justify-center">
              <v-icon class="remove-btn" color="red" @click="() => deleteImage(index)" size="40">mdi
                mdi-close-circle-outline</v-icon>
            </v-img>
          </v-col>
        </v-row>
        <!-- File Input -->
        <v-row>
          <v-col cols="12" class="mt-4">
            <div style="margin-bottom: 1%; font-weight: bold">อัปโหลดรูปภาพ</div>
            <v-file-input :key="fileInputKey" multiple prepend-icon="mdi-camera" filled @change="handleFileChange"
              accept="image/*" variant="outlined" :disabled="checkConfirmImage()"
              :error-messages="imageFiles.length === 5 ? [] : ['ต้องอัปโหลดรูปภาพให้ครบ 5 รูป']"></v-file-input>
          </v-col>
        </v-row>
        <!-- Button to Select Teacher -->
        <v-row class="my-4" v-if="showTeacherSelection">
          <v-col cols="12">
            <v-row align="center">
              <v-col cols="auto">
                <v-text class="font-weight-bold" style="font-size: 16px; color: #424242">
                  เลือกครูที่จะส่งรูปภาพ:
                </v-text>
              </v-col>
              <v-col cols="auto">
                <v-btn color="primary" elevation="2" rounded class="px-4" @click="showTeacherDialog = true">
                  เลือกอาจารย์
                </v-btn>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="12" class="mt-2">
            <v-row align="center">
              <v-col cols="auto">
                <v-text class="font-weight-bold" style="font-size: 16px; color: #424242">
                  อาจารย์ที่เลือก:
                </v-text>
              </v-col>
              <v-col>
                <v-text style="font-size: 16px; color: #1976d2">
                  {{ selectedTeacherName || "ยังไม่ได้เลือกอาจารย์" }}
                </v-text>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
        <!-- Teacher Selection Dialog -->
        <v-dialog v-model="showTeacherDialog" max-width="500px">
          <v-card>
            <v-card-title class="font-weight-bold" style="font-size: 20px">
              เลือกอาจารย์
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <v-list>
                <v-list-item v-for="teacher in teachers" :key="teacher.userId" @click="selectTeacher(teacher)"
                  class="teacher-list-item" style="cursor: pointer">
                  <v-list-item-content>
                    <v-list-item-title class="text-body-1" style="font-weight: 500">
                      {{ teacher.firstName }} {{ teacher.lastName }}
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions class="justify-space-between">
              <v-btn color="red" class="font-weight-bold" @click="clearSelectedTeacher">
                ยกเลิก
              </v-btn>
              <v-btn color="primary" class="font-weight-bold" @click="confirmTeacherSelection">
                ยืนยัน
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <!-- Upload Button -->
        <v-row v-if="!hasUploadedImages" style="justify-content: center; font-weight: bold">
          <div style="color: red">ไม่มีรูปภาพ</div>
        </v-row>
        <v-row>
          <v-btn color="error" style="font-size: 20px" @click="close" variant="text">
            ยกเลิก
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn :disabled="!canUpload" style="font-size: 20px" color="primary" @click="save"
            v-tooltip="'กรุณาอัปโหลดรูปภาพให้ครบ 5 รูป โดยรูปภาพห้ามซ้ำกัน'" variant="text">
            ยืนยัน
          </v-btn>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
  <!-- Snackbar for showing errors -->
  <v-snackbar v-model="snackbarVisible" :color="snackbarColor" top right :timeout="3000">
    {{ snackbarMessage }}
    <template v-slot:actions>
      <v-btn color="white" @click="snackbarVisible = false">Close</v-btn>
    </template>
  </v-snackbar>
</template>

<style scoped>
.headline {
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bolder;
}

.image-container {
  position: relative;
  margin-bottom: 1rem;
}

.v-alert {
  background-color: #e3f2fd;
  border-color: #1976d2;
}

.v-card {
  height: 800px;
  /* Ensure the dialog is square */
  overflow: hidden;
  /* Prevent content overflow */
}

.teacher-list-item:hover {
  background-color: #f4f4f4;
}

.v-card-actions {
  padding: 16px;
}

.loader-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.remove-btn {
  position: absolute;
  top: 0px;
  right: 27px;
}

.v-btn {
  min-width: 130px;
}
</style>