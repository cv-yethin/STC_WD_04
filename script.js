// ================================
//          DOM SELECTORS
// ================================
const addTaskBtn = document.querySelector(".add_task");
const inputBox = document.querySelector(".input_box");
const footer = document.querySelector(".footer");
const tot = document.querySelector(".tot");
const len = document.querySelector(".len");
const pbBar = document.querySelector(".pb_bar_upr");

const skipKeys = ["Meta", "Control", "Shift", "Alt", "Backspace"];

// ================================
//         INPUT HELPERS
// ================================
function isInputEmpty() {
  return inputBox.value.trim() === "";
}

function showShake() {
  inputBox.classList.add("shake");
  setTimeout(() => inputBox.classList.remove("shake"), 1000);
}

// ================================
//         TASK GENERATION
// ================================
function generateTaskHTML(text) {
  const wrapper = document.createElement("div");

  wrapper.innerHTML = `
    <div class="main__tasks">
      <label class="custom-checkbox">
        <input type="checkbox">
        <span class="checkmark"></span>
        </label>
        <div class="text-wrapper">
          <span class="task">${text}</span>
          <input class="edit_text" type="text">
        </div>

      <div class="buttons">
        <div class="edit">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
          </svg>
        </div>

        <div class="delete">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        </div>
      </div>
    </div>
  `;

  return wrapper;
}

// ================================
//         TASK MANAGEMENT
// ================================
function addTask() {
  if (isInputEmpty()) {
    showShake();
    return;
  }

  const newTask = generateTaskHTML(inputBox.value);
  footer.appendChild(newTask);

  inputBox.value = "";
  inputBox.blur();

  updateCounters();
  updateProgressBar();
  toggleNoTaskMessage();
}

function deleteTask(taskElement) {
  taskElement.remove();
  updateCounters();
  updateCheckedCount();
  updateProgressBar();
  toggleNoTaskMessage();
}

function toggleTaskCheckbox(taskElement) {
  const checkbox = taskElement.querySelector("input[type='checkbox']");
  const taskText = taskElement.querySelector(".task");
  if (!checkbox) return;

  // Toggle strikethrough based on current checkbox state
  taskText.classList.toggle("completed", checkbox.checked);

  // Update counters and progress bar
  updateCheckedCount();
  updateProgressBar();
}

// ================================
//            COUNTERS
// ================================
function updateCounters() {
  tot.textContent = footer.querySelectorAll(".main__tasks").length;
}

function updateCheckedCount() {
  const count = document.querySelectorAll(
    ".custom-checkbox input:checked"
  ).length;
  len.textContent = count;
}

function updateProgressBar() {
  const total = Number(tot.textContent);
  const done = Number(len.textContent);
  pbBar.style.width = total ? (done / total) * 100 + "%" : "0%";
  pbBar.style.backgroundColor = "#DFEAC7";
}

// ================================
//          EVENT HANDLERS
// ================================
function handleFooterClick(e) {
  const taskElement = e.target.closest(".main__tasks");
  if (!taskElement) return;

  // Don't handle clicks if we're currently editing
  if (taskElement.querySelector(".text-wrapper.editing")) return;

  // Don't toggle if clicking on edit or delete buttons
  if (e.target.closest(".delete")) {
    deleteTask(taskElement);
    return;
  }

  if (e.target.closest(".edit")) return;

  // Click anywhere on the task (except icons) to toggle checkbox
  const checkbox = taskElement.querySelector("input[type='checkbox']");
  checkbox.checked = !checkbox.checked;

  // Update the visual state
  const taskText = taskElement.querySelector(".task");
  taskText.classList.toggle("completed", checkbox.checked);

  updateCheckedCount();
  updateProgressBar();
}

function handleGlobalKeydown(e) {
  // Don't interfere if user is editing a task
  if (document.querySelector(".text-wrapper.editing")) return;

  if (e.key === "Enter") {
    // Prevent adding task if input is empty (will trigger shake)
    if (!isInputEmpty()) {
      addTask();
    }
    return;
  }

  if (document.activeElement !== inputBox && !skipKeys.includes(e.key)) {
    inputBox.focus();
  }
}

function handleMetaDelete(e) {
  if (e.metaKey && e.key === "Backspace") {
    const firstTask = document.querySelector(".main__tasks");
    if (firstTask) deleteTask(firstTask);
  }
}

function handleCheckboxChange(e) {
  const taskElement = e.target.closest(".main__tasks");
  if (!taskElement) return;
  const taskText = taskElement.querySelector(".task");
  taskText.classList.toggle("completed", e.target.checked);

  updateCheckedCount();
  updateProgressBar();
}

// ================================
// EDIT FUNCTIONALITY
// ================================
function handleEditClick(e) {
  const editBtn = e.target.closest(".edit");
  if (!editBtn) return;

  const taskElement = editBtn.closest(".main__tasks");
  const textWrapper = taskElement.querySelector(".text-wrapper");
  const taskText = taskElement.querySelector(".task");
  const editInput = taskElement.querySelector(".edit_text");

  // Show input and hide text
  textWrapper.classList.add("editing");
  editInput.value = taskText.textContent;
  editInput.focus();
  editInput.setSelectionRange(editInput.value.length, editInput.value.length);

  // Save function
  const saveEdit = () => {
    const trimmedValue = editInput.value.trim();
    if (trimmedValue !== "") {
      taskText.textContent = trimmedValue;

      // Uncheck the task after editing
      const checkbox = taskElement.querySelector("input[type='checkbox']");
      checkbox.checked = false;
      taskText.classList.remove("completed");

      // Update counters and progress bar
      updateCheckedCount();
      updateProgressBar();
    }
    textWrapper.classList.remove("editing");

    // Clean up event listeners
    editInput.removeEventListener("keydown", handleEditKeydown);
    editInput.removeEventListener("blur", handleEditBlur);
  };

  // Handle Enter and Escape keys
  const handleEditKeydown = (ev) => {
    if (ev.key === "Enter") {
      ev.preventDefault();
      saveEdit();
    } else if (ev.key === "Escape") {
      // Cancel edit without saving
      textWrapper.classList.remove("editing");
      editInput.removeEventListener("keydown", handleEditKeydown);
      editInput.removeEventListener("blur", handleEditBlur);
    }
  };

  // Handle blur (clicking outside)
  const handleEditBlur = () => {
    saveEdit();
  };

  // Attach event listeners
  editInput.addEventListener("keydown", handleEditKeydown);
  editInput.addEventListener("blur", handleEditBlur);
}

// ================================
// INITIAL EVENT BINDING
// ================================
addTaskBtn.addEventListener("click", addTask);
footer.addEventListener("click", handleFooterClick);
footer.addEventListener("click", handleEditClick);
footer.addEventListener("change", handleCheckboxChange);
window.addEventListener("keydown", handleGlobalKeydown);
window.addEventListener("keydown", handleMetaDelete);

function toggleNoTaskMessage() {
  const no_task = document.querySelector(".no_task");
  if (!no_task) return; // Exit if element doesn't exist

  if (footer.querySelectorAll(".main__tasks").length !== 0) {
    no_task.style.display = "none";
  } else {
    no_task.style.display = "block";
  }
}
