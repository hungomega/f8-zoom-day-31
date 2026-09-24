const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const addBtn = $(".add-btn");
const form = $("#addTaskModal");
const dauX = $(".modal-close"); // dấu x
const btnCancel = $(".btn-cancel"); // nút huỷ
const firstInput = $("#taskTitle"); // input đầu
const todoForm = $(".todo-app-form");
const todoList = $("#todoList"); // LẤY PHẦN TỬ CHỨA DANH SÁCH TASK
const editButtons = $(".edit-btn");
const searchInput = $(".search-input");
let todoTask = [];
let editIndex = null;
console.log(searchInput);

searchInput.onclick = function (event) {
    console.log(searchInput.value);
};

function dongform() {
    form.className = "modal-overlay";
    todoForm.reset();

    const formTitle = form.querySelector(`.modal-title`);
    if (formTitle) {
        {
            const original =
                formTitle.dataset.original || formTitle.textContent;
            formTitle.textContent = formTitle.dataset.original;
            delete formTitle.dataset.original;
        }
    }
    const submitBtn = form.querySelector(`.btn-submit`);
    if (submitBtn) {
        {
            submitBtn.textContent =
                submitBtn.dataset.original || submitBtn.textContent;
            delete submitBtn.dataset.original;
        }
    }
    editIndex = null;
}
function moform() {
    form.className = "modal-overlay show";

    setTimeout(() => {
        firstInput.focus();
    }, 100);
}

// 1.hiện thị form Add New Task
addBtn.onclick = moform;

// Đóng form
dauX.onclick = dongform;
btnCancel.onclick = dongform;

// const todoTask = [];

console.log(todoTask);

//3. Xử lý form submission (*gọi api)
todoForm.onsubmit = async function (event) {
    event.preventDefault();

    const formData = Object.fromEntries(new FormData(todoForm));

    try {
        if (editIndex) {
            const response = await fetch(
                `http://localhost:3000/tasks/${editIndex}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                },
            );

            const updatedTask = await response.json();

            todoTask = todoTask.map((task) =>
                task.id === editIndex ? updatedTask : task,
            );

            todoList.innerHTML = renderTasks();
        } else {
            // CREATE
            formData.isCompleted = false;

            const response = await fetch("http://localhost:3000/tasks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const newTask = await response.json();

            todoTask.unshift(newTask);

            todoList.innerHTML = renderTasks();
        }

        dongform();
    } catch (error) {
        console.log(error);
    }
};

// bài toán bấm vào edit thì mở form ở các item đã được add new task
todoList.onclick = async function (event) {
    const editBtn = event.target.closest(".edit-btn"); //  event.target là element tìm dần phần tử cha có clasee edit-btn ko ?
    const deleteBtn = event.target.closest(".delete-btn");
    const completeBtn = event.target.closest(".complete-btn");

    if (editBtn) {
        const taskId = editBtn.dataset.id;
        const valueTask = todoTask.find((task) => task.id === taskId);

        editIndex = taskId;
        // edit

        for (const key in valueTask) {
            const value = valueTask[key];
            const input = $(`[name="${key}"]`);
            if (input) {
                input.value = value;
            }
        }
        const formTitle = form.querySelector(`.modal-title`);
        if (formTitle) {
            {
                formTitle.dataset.original = formTitle.textContent;
                formTitle.textContent = "Edit task";
            }
        }

        const submitBtn = form.querySelector(`.btn-submit`);
        if (submitBtn) {
            {
                submitBtn.dataset.original = submitBtn.textContent;
                submitBtn.textContent = "Save Task";
            }
        }
        moform();
    }

    // Xoá item
    if (deleteBtn) {
        const taskId = deleteBtn.dataset.id;
        const task = todoTask.find((task) => task.id === taskId);

        if (confirm(`Bạn có chắc muốn xoá công việc "${task.title}" ?`)) {
            try {
                await fetch(`http://localhost:3000/tasks/${taskId}`, {
                    method: "DELETE",
                });

                todoTask = todoTask.filter((task) => task.id !== taskId);

                todoList.innerHTML = renderTasks();
            } catch (error) {
                console.log(error);
            }
        }
    }
    if (completeBtn) {
        const taskId = completeBtn.dataset.id;
        const task = todoTask.find((task) => task.id === taskId);

        try {
            const response = await fetch(
                `http://localhost:3000/tasks/${taskId}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        isCompleted: !task.isCompleted,
                    }),
                },
            );

            const updatedTask = await response.json();

            todoTask = todoTask.map((task) =>
                task.id === taskId ? updatedTask : task,
            );

            todoList.innerHTML = renderTasks();
        } catch (error) {
            console.log(error);
        }
    }
};

async function getTasks() {
    try {
        const response = await fetch("http://localhost:3000/tasks"); // gửi GET đến json-server.
        const data = await response.json(); // lấy JSON mà server trả về.

        todoTask = data; // → đưa dữ liệu server vào biến JS.

        todoList.innerHTML = renderTasks(); // → render lên giao diện.
    } catch (error) {
        console.log(error);
    }
}
//5.hiện ra giao diện
function renderTasks() {
    if (!todoTask.length) {
        return "<p>Chưa có việc phải làm ...</p>";
    }
    const html = todoTask
        .map(function (task, index) {
            return `<div class="task-card ${escapeHTML(task.color)} ${task.isCompleted ? "completed" : ""}">
                    <div class="task-header">
                        <h3 class="task-title"> ${escapeHTML(task.title)} </h3>
                        <button class="task-menu">
                            <i class="fa-solid fa-ellipsis fa-icon"></i>
                            <div class="dropdown-menu">
                                <div class="dropdown-item edit-btn" data-id="${task.id}">
                                    <i
                                        class="fa-solid fa-pen-to-square fa-icon"
                                    ></i>
                                    Edit
                                </div>
                                <div class="dropdown-item complete complete-btn" data-id="${task.id}">
                                    <i class="fa-solid fa-check fa-icon"></i>
                 
                                    ${task.isCompleted ? "Mark as Active" : "Mark as Complete"}
                                </div>
                                <div class="dropdown-item delete delete-btn" data-id="${task.id}">
                                    <i class="fa-solid fa-trash fa-icon"></i>
                                    Delete
                                </div>
                            </div>
                        </button>
                    </div>
                    <p class="task-description">
                      ${escapeHTML(task.description)}
                    </p>
                      <div class="task-time">
                         ${escapeHTML(task.startTime)} AM - ${escapeHTML(task.endTime)} PM
                    </div>
                </div>`;
        })
        .join("");

    return html;
}

// render lần đầu
todoList.innerHTML = renderTasks();
// localStorage.clear();

// $("body").onclick = () => alert("TEST");

// $(`.tabs`).onclick = event => {
//     console.log(event.target.closet('.completed-btn'));

//     event.stopPropagation();
// };

function escapeHTML(html) {
    const div = document.createElement("div");
    div.textContent = html;
    return div.innerHTML;
}
getTasks();
