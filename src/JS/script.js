document.addEventListener("DOMContentLoaded", () => {
  // Select all views and header
  const views = document.querySelectorAll(".view-container");
  const header = document.querySelector(".Upper");
  const modalALert = document.querySelector(".alertModal");

  // View 1
  const view1 = {
    inputOperator: document.getElementById("NAME"),
    btnEnter: document.getElementById("enterBtn"),
    operator: "",
  };

  // View 2
  const view2 = {
    nameOperator: document.querySelector(".nameOperator"),
    btnBack: document.getElementById("backBtn"),
    inputPN: document.getElementById("PN"),
    inputQTY: document.getElementById("QTY"),
    btnMode: document.getElementById("modeBtn"),
    btnAdd: document.getElementById("addBtn"),
    btnQueue: document.getElementById("queueBtn"),
  };

  // View 3
  const view3 = {
    btnPrev: document.getElementById("prevBtn"),
    btnNext: document.getElementById("nextBtn"),
    btnDelete: document.getElementById("deleteBtn"),
    btnClear: document.getElementById("clearBtn"),
  };

  // State variables
  const state = {
    Actualview: 0,
    isAuto: true, // boolean toggle button
    lastPn: "", // last pn readed by he operator
    qtyCount: 0, // auto count
    qrcodeQueue: [],
    ActualIndex: 0, // index to alternate by the qrcodes on the queue.
    focusTarget: null, // armazena qual input deve receber foco após alert
  };

  // Initial focus
  view1.inputOperator.focus();

  // Saves the user to the user type it just once!
  view1.inputOperator.addEventListener("input", () => {
    view1.operator = view1.inputOperator.value.toUpperCase().trim();
  });

  // Enter button at view 1
  view1.btnEnter.addEventListener("click", () => {
    const input = view1.inputOperator;
    if (input.value.trim() !== "") {
      view1.operator = input.value.toUpperCase().trim();
      view2.nameOperator.innerHTML = `OPERADOR: ${view1.operator}`;

      // Alternate views
      views[0].classList.remove("view__ACTIVE");
      views[0].classList.add("view__INACTIVE");

      views[1].classList.remove("view__INACTIVE");
      views[1].classList.add("view__ACTIVE");

      header.classList.replace("view__INACTIVE", "view__ACTIVE");

      view2.inputPN.focus(); // Focus at the first input on the actual view!
      view2.inputQTY.value = state.qtyCount;

      state.Actualview++;
    } else {
      customAlert("Insira o nome de usuário!");
      input.focus();
    }
  });

  // Back to the previous view!
  view2.btnBack.addEventListener("click", () => {
    // Alterna as views

    if (state.Actualview === 1) {
      views[0].classList.remove("view__INACTIVE");
      views[0].classList.add("view__ACTIVE");

      views[1].classList.remove("view__ACTIVE");
      views[1].classList.add("view__INACTIVE");
      header.classList.replace("view__ACTIVE", "view__INACTIVE");
      state.lastPn = "";
      state.qtyCount = 0;
      view2.inputPN.placeholder = "";
      view2.inputPN.value = "";
      if (state.isAuto === false) {
        view2.btnMode.click();
      }

      // Clear queue and hide queue button
      state.qrcodeQueue = [];
      view2.btnQueue.innerText = "QUEUE";
      view2.btnQueue.classList.replace(
        "btns_visible",
        "btn_invisible_otherviews",
      );
      view2.btnQueue.disabled = true;

      state.Actualview--;
    } else if (state.Actualview === 2) {
      views[1].classList.replace("view__INACTIVE", "view__ACTIVE");

      views[2].classList.replace("view__ACTIVE", "view__INACTIVE");

      // Limpa inputs e placeholder quando volta da view 3
      view2.inputPN.value = "";
      view2.inputPN.placeholder = "";
      view2.inputQTY.value = "0";
      state.qtyCount = 0;
      state.lastPn = "";
      view2.inputPN.focus();

      // Update queue button text with current length
      if (state.qrcodeQueue.length > 0) {
        view2.btnQueue.innerText = `QUEUE(${state.qrcodeQueue.length})`;
      } else {
        view2.btnQueue.innerText = "QUEUE";
        view2.btnQueue.classList.replace(
          "btns_visible",
          "btn_invisible_otherviews",
        );
        view2.btnQueue.disabled = true;
      }

      state.Actualview--;
    }
    if (state.isAuto === false) {
      view2.btnMode.click();
    }

    view1.inputOperator.value = ""; //sets 0 to operator input
    view1.inputOperator.focus(); // Focus at the first input on the previous view!
  });

  // Auto/Manual mode button
  view2.btnMode.addEventListener("click", () => {
    state.isAuto = !state.isAuto; // Toggle button to alternate the input state.

    if (state.isAuto === true) {
      state.lastPn = "";
      view2.inputPN.placeholder = "";
      view2.inputPN.value = "";
      view2.inputQTY.disabled = true;
      state.qtyCount = 0;
      view2.inputQTY.value = state.qtyCount;
      view2.inputPN.focus();
    } else {
      view2.inputQTY.disabled = false;
      state.lastPn = "";

      if (view2.inputPN.placeholder !== "") {
        view2.inputPN.value = view2.inputPN.placeholder;
        view2.inputPN.placeholder = "";
        view2.inputQTY.value = "";
        view2.inputQTY.focus();
      } else {
        state.qtyCount = 0;
        view2.inputQTY.value = "";

        if (view2.inputPN.value.trim() !== "") {
          view2.inputQTY.focus();
        } else {
          view2.inputPN.focus();
        }
      }
    }
  });

  // Add qrcodes to queue button
  view2.btnAdd.addEventListener("click", () => {
    let ultimopn;

    // CORREÇÃO: Não resetar state.lastPn aqui, senão ultimopn sempre será "" no modo Auto.
    if (state.isAuto) {
      ultimopn = state.lastPn;
    } else {
      ultimopn = view2.inputPN.value.toUpperCase().trim();
    }

    const allFilled =
      ultimopn !== "" &&
      view2.inputQTY.value.trim() !== "" &&
      view2.inputQTY.value !== "0";

    if (allFilled) {
      let concatvalues = `${view1.operator},${ultimopn},${view2.inputQTY.value}`;
      let desconcatvalues = concatvalues.toUpperCase().split(",");

      let leftPn = desconcatvalues[1].slice(0, 5);
      let midPn = desconcatvalues[1].slice(5, 10);
      let rightPn = desconcatvalues[1].slice(10);

      let pnFormatted;
      if (desconcatvalues[1].length === 12) {
        // PN com 12 caracteres: xxxxx-xxxxx-xx
        pnFormatted = `${leftPn}-${midPn}-${rightPn}`;
      } else if (desconcatvalues[1].length === 10) {
        // PN com 10 caracteres: xxxxx-xxxxx
        pnFormatted = `${leftPn}-${midPn}`;
      } else if (desconcatvalues[1].length <= 5) {
        // PN com 5 ou menos caracteres: xxxxx
        pnFormatted = leftPn;
      } else {
        // PN com 6-9 ou 11 ou 13+ caracteres: xxxxx-xxxxx
        pnFormatted = `${leftPn}-${midPn}`;
      }

      state.qrcodeQueue.push({
        qrcode: concatvalues,
        infos: `PN: ${pnFormatted}<br>QTY: ${desconcatvalues[2]}`,
      });

      view2.btnQueue.innerText = `QUEUE(${state.qrcodeQueue.length})`;
      view2.btnQueue.classList.replace(
        "btn_invisible_otherviews",
        "btns_visible",
      );
      view2.btnQueue.disabled = false;

      // Limpeza após sucesso
      view2.inputPN.focus();
      view2.inputPN.value = "";
      view2.inputPN.placeholder = "";
      state.qtyCount = 0;
      state.lastPn = ""; // Reseta o PN apenas após adicionar à fila
      if (state.isAuto === true) {
        view2.inputQTY.value = 0;
      } else {
        view2.inputQTY.value = "";
      }
    } else {
      // Determina qual input deve receber foco baseado no modo e campos vazios
      if (state.isAuto) {
        state.focusTarget = view2.inputPN;
      } else {
        // No modo Manual, prioriza PN vazio, depois QTY vazio
        if (ultimopn === "") {
          state.focusTarget = view2.inputPN;
        } else if (
          view2.inputQTY.value.trim() === "" ||
          view2.inputQTY.value === "0"
        ) {
          state.focusTarget = view2.inputQTY;
        } else {
          state.focusTarget = view2.inputPN;
        }
      }

      customAlert("Todos os campos devem ser preenchidos!");
    }
  });

  // Queue button - to see the qrcode queue sequence

  view2.btnQueue.addEventListener("click", () => {
    if (state.qrcodeQueue.length > 0) {
      views[1].classList.replace("view__ACTIVE", "view__INACTIVE");
      views[2].classList.replace("view__INACTIVE", "view__ACTIVE");

      // Reset to first item
      state.ActualIndex = 0;

      // Generate QR code for the first item
      generateQrCode(state.qrcodeQueue[0].qrcode);

      // Display info and count
      document.getElementById("codeInfo").innerHTML =
        state.qrcodeQueue[0].infos;
      document.getElementById("codeCount").textContent = `${
        state.ActualIndex + 1
      }/${state.qrcodeQueue.length}`;

      // Handle button visibility
      if (state.qrcodeQueue.length === 1) {
        view3.btnPrev.classList.add("disabled");
        view3.btnPrev.tabIndex = -1;
        view3.btnNext.classList.add("disabled");
        view3.btnNext.tabIndex = -1;
        view3.btnDelete.classList.remove("btns_visible");
        view3.btnDelete.classList.add("btn_invisible_otherviews");
        view3.btnDelete.tabIndex = -1;
        view3.btnClear.classList.remove("btn_invisible_otherviews");
        view3.btnClear.classList.add("btns_visible");
        view3.btnClear.tabIndex = 0;
      } else if (state.qrcodeQueue.length > 1) {
        view3.btnPrev.classList.add("disabled");
        view3.btnPrev.tabIndex = -1;
        view3.btnNext.classList.remove("disabled");
        view3.btnNext.tabIndex = 0;
        view3.btnDelete.classList.remove("btn_invisible_otherviews");
        view3.btnDelete.classList.add("btns_visible");
        view3.btnDelete.tabIndex = 0;
        view3.btnClear.classList.remove("btns_visible");
        view3.btnClear.classList.add("btn_invisible_otherviews");
        view3.btnClear.tabIndex = -1;
      }

      state.Actualview++;
    }
  });

  // Next button - navigate to next QR code
  view3.btnNext.addEventListener("click", () => {
    if (state.ActualIndex < state.qrcodeQueue.length - 1) {
      state.ActualIndex++;

      // Generate QR code for current item
      generateQrCode(state.qrcodeQueue[state.ActualIndex].qrcode);

      // Display info and count
      document.getElementById("codeInfo").innerHTML =
        state.qrcodeQueue[state.ActualIndex].infos;
      document.getElementById("codeCount").textContent = `${
        state.ActualIndex + 1
      }/${state.qrcodeQueue.length}`;

      // Show prev button
      view3.btnPrev.classList.remove("disabled");
      view3.btnPrev.tabIndex = 0;

      // Hide next button if at the end
      if (state.ActualIndex === state.qrcodeQueue.length - 1) {
        view3.btnNext.classList.add("disabled");
        view3.btnNext.tabIndex = -1;

        view3.btnDelete.tabIndex = -1;
        view3.btnClear.classList.replace(
          "btn_invisible_otherviews",
          "btns_visible",
        );
        view3.btnClear.tabIndex = 0;
      }
    }
  });

  // Prev button - navigate to previous QR code
  view3.btnPrev.addEventListener("click", () => {
    if (state.ActualIndex > 0) {
      state.ActualIndex--;

      // Generate QR code for current item
      generateQrCode(state.qrcodeQueue[state.ActualIndex].qrcode);

      // Display info and count
      document.getElementById("codeInfo").innerHTML =
        state.qrcodeQueue[state.ActualIndex].infos;
      document.getElementById("codeCount").textContent = `${
        state.ActualIndex + 1
      }/${state.qrcodeQueue.length}`;

      // Show next button
      view3.btnNext.classList.remove("disabled");
      view3.btnNext.tabIndex = 0;

      // Hide prev button if at the beginning
      if (state.ActualIndex === 0) {
        view3.btnPrev.classList.add("disabled");
        view3.btnPrev.tabIndex = -1;
      }

      // Show DELETE button when not at the last item
      if (state.ActualIndex < state.qrcodeQueue.length - 1) {
        view3.btnDelete.classList.replace(
          "btn_invisible_otherviews",
          "btns_visible",
        );
        view3.btnDelete.tabIndex = 0;
        view3.btnClear.classList.replace(
          "btns_visible",
          "btn_invisible_otherviews",
        );
        view3.btnClear.tabIndex = -1;
      }
    }
  });

  // Delete button - remove current QR code from queue
  view3.btnDelete.addEventListener("click", () => {
    if (state.qrcodeQueue.length > 0) {
      // Show delete message
      const deleteMsg = document.querySelector(".deleteItem");
      deleteMsg.style.display = "flex";

      // Wait 2 seconds then delete
      setTimeout(() => {
        deleteMsg.style.display = "none";

        // Remove current item from queue
        state.qrcodeQueue.splice(state.ActualIndex, 1);

        // If queue becomes empty, go back
        if (state.qrcodeQueue.length === 0) {
          view2.btnBack.click();
          return;
        }

        // Adjust index if necessary
        if (state.ActualIndex >= state.qrcodeQueue.length) {
          state.ActualIndex = state.qrcodeQueue.length - 1;
        }

        // Update display
        generateQrCode(state.qrcodeQueue[state.ActualIndex].qrcode);
        document.getElementById("codeInfo").innerHTML =
          state.qrcodeQueue[state.ActualIndex].infos;
        document.getElementById("codeCount").textContent = `${
          state.ActualIndex + 1
        }/${state.qrcodeQueue.length}`;

        // Update button visibility
        if (state.qrcodeQueue.length === 1) {
          view3.btnPrev.classList.add("disabled");
          view3.btnPrev.tabIndex = -1;
          view3.btnNext.classList.add("disabled");
          view3.btnNext.tabIndex = -1;
          view3.btnDelete.classList.replace(
            "btns_visible",
            "btn_invisible_otherviews",
          );
          view3.btnDelete.tabIndex = -1;
          view3.btnClear.classList.replace(
            "btn_invisible_otherviews",
            "btns_visible",
          );
          view3.btnClear.tabIndex = 0;
        } else if (state.ActualIndex === state.qrcodeQueue.length - 1) {
          view3.btnNext.classList.add("disabled");
          view3.btnNext.tabIndex = -1;
          view3.btnDelete.classList.replace(
            "btns_visible",
            "btn_invisible_otherviews",
          );
          view3.btnDelete.tabIndex = -1;
          view3.btnClear.classList.replace(
            "btn_invisible_otherviews",
            "btns_visible",
          );
          view3.btnClear.tabIndex = 0;
          // Show prev button if not at beginning
          if (state.ActualIndex > 0) {
            view3.btnPrev.classList.remove("disabled");
            view3.btnPrev.tabIndex = 0;
          }
        } else {
          view3.btnDelete.classList.replace(
            "btn_invisible_otherviews",
            "btns_visible",
          );
          view3.btnDelete.tabIndex = 0;
          view3.btnClear.classList.replace(
            "btns_visible",
            "btn_invisible_otherviews",
          );
          view3.btnClear.tabIndex = -1;
          // Show next button
          view3.btnNext.classList.remove("disabled");
          view3.btnNext.tabIndex = 0;
          // Show prev button if not at beginning
          if (state.ActualIndex > 0) {
            view3.btnPrev.classList.remove("disabled");
            view3.btnPrev.tabIndex = 0;
          } else {
            view3.btnPrev.classList.add("disabled");
            view3.btnPrev.tabIndex = -1;
          }
        }
      }, 800);
    }
  });

  // Clear button - delete entire queue
  view3.btnClear.addEventListener("click", () => {
    // Show clear message
    const deleteMsg = document.querySelector(".deleteItem");
    deleteMsg.textContent = "FILA EXCLUÍDA COM SUCESSO";
    deleteMsg.style.display = "flex";

    // Wait 2 seconds then clear and go back
    setTimeout(() => {
      deleteMsg.style.display = "none";
      deleteMsg.textContent = "ITEM EXCLUIDO"; // Reset text
      state.qrcodeQueue = [];
      view2.btnBack.click();
    }, 800);
  });

  // Mobile navigation settings
  let input = [view2.inputPN, view2.inputQTY];
  const inputElements = Object.values(input);

  document.addEventListener("keydown", (event) => {
    const activeElement = document.activeElement;
    const currentIndex = inputElements.indexOf(activeElement);

    // 1. BLOQUEIO DE TECLAS INDESEJADAS
    const blockedKeys = [
      "F5",
      "F6",
      "F7",
      "F8",
      "F10",
      "F11",
      "F12",
      "Alt",
      "Control",
      "Shift",
    ];
    if (blockedKeys.includes(event.key)) {
      event.preventDefault();
      return;
    }

    // 2. SWITCH ROBUSTO (CENTRAL DE COMANDOS)
    switch (event.key) {
      case "F1":
        event.preventDefault();
        if (state.Actualview === 1 && state.qrcodeQueue.length > 0) {
          view2.btnQueue.click();
        } else if (state.Actualview === 2 && state.qrcodeQueue.length > 1) {
          view3.btnDelete.click();
        }
        break;

      case "F2":
        event.preventDefault();
        if (state.Actualview === 1 && state.qrcodeQueue.length > 0) {
          if (view2.btnClearQueue) view2.btnClearQueue.click();
        } else if (
          state.Actualview === 2 &&
          state.ActualIndex === state.qrcodeQueue.length - 1
        ) {
          view3.btnClear.click();
        }
        break;

      case "F3":
        event.preventDefault();
        if (state.Actualview === 1) {
          view2.btnMode.click();
        }
        break;

      case "F4":
        event.preventDefault();
        if (state.Actualview === 0) {
          view1.btnEnter.click();
        } else if (state.Actualview === 1) {
          view2.btnAdd.click();
        }
        break;

      case "F9":
        event.preventDefault();
        if (state.Actualview === 1 || state.Actualview === 2) {
          view2.btnBack.click();
        }
        break;

      case "ArrowRight":
      case "6":
        if (state.Actualview === 2) {
          event.preventDefault();
          if (view3.btnNext) view3.btnNext.click();
        }
        break;

      case "ArrowLeft":
      case "4":
        if (state.Actualview === 2) {
          event.preventDefault();
          if (view3.btnPrev) view3.btnPrev.click();
        }
        break;

      case "ArrowDown":
        if (state.Actualview === 1 && currentIndex < inputElements.length - 1) {
          event.preventDefault();
          inputElements[currentIndex + 1].focus();
        }
        break;

      case "ArrowUp":
        if (currentIndex > 0) {
          event.preventDefault();
          inputElements[currentIndex - 1].focus();
        }
        break;

      case "Tab":
      case "Enter":
        event.preventDefault();

        if (modalALert.style.display === "flex") {
          // Fecha o modal e aplica o foco do focusTarget
          modalALert.style.display = "none";

          if (state.Actualview === 0) {
            view1.inputOperator.focus();
          } else if (state.Actualview === 1 && state.focusTarget) {
            state.focusTarget.focus();
            state.focusTarget = null;
          } else if (state.Actualview === 1) {
            view2.inputPN.focus();
          }
          return;
        }
        const currentPn = view2.inputPN.value.trim().toUpperCase();

        if (state.Actualview === 1 && state.isAuto) {
          if (currentPn === "" && state.lastPn === "") {
            customAlert("Insira algum Pn!");
          } else if (state.lastPn === "" || currentPn === state.lastPn) {
            if (state.lastPn === "") {
              state.lastPn = currentPn;
            }

            state.qtyCount++;
            view2.inputQTY.value = state.qtyCount;
            view2.inputPN.placeholder = state.lastPn;
            view2.inputPN.value = "";
            view2.inputPN.focus();
          } else {
            customAlert("Part-number incorreto!");
            view2.inputPN.focus();
            view2.inputPN.select();
          }
        } else if (state.Actualview === 0) {
          if (view1.inputOperator.value.trim() !== "") {
            view1.btnEnter.click();
          } else {
            customAlert("Insira o nome de usuário!");
          }
        } else if (currentIndex === inputElements.length - 1) {
          view2.btnAdd.click();
        } else if (!state.isAuto && currentIndex < inputElements.length - 1) {
          inputElements[currentIndex + 1].focus();
        }
        break;
    }
  });

  function generateQrCode(dados) {
    const qrcodeContainer = document.querySelector(".qrcode");
    qrcodeContainer.innerHTML = "";
    const size = qrcodeContainer.offsetWidth * 0.8;

    new QRCode(qrcodeContainer, {
      text: dados.toUpperCase(),
      width: size,
      height: size,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H,
    });
  }

  const alertMessage = document.querySelector(".alertMessage");
  const alertBtn = document.querySelector(".alertConfirm");
  function customAlert(msg) {
    modalALert.style.display = "flex";
    alertMessage.innerText = msg;
    alertBtn.focus();
  }

  alertBtn.onclick = () => {
    modalALert.style.display = "none";

    // Retorna o foco para o input apropriado
    if (state.Actualview === 0) {
      view1.inputOperator.focus();
    } else if (state.Actualview === 1 && state.focusTarget) {
      state.focusTarget.focus();
      state.focusTarget = null; // Limpa após usar
    } else if (state.Actualview === 1) {
      // Fallback
      view2.inputPN.focus();
    }
  };
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.error("Falha ao registrar Service Worker:", error);
    });
  });
}
