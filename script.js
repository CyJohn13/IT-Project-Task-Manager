
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const priorityInput = document.getElementById("priorityInput");
const taskList = document.getElementById("taskList");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const remainingTasks = document.getElementById("remainingTasks");
const progressText = document.getElementById("progressText");
const progressBar = document.getElementById("progressBar");

const STORAGE_KEY = "projectTaskManagerTasks";

let tasks = [];

try {
    const savedTasks = localStorage.getItem(STORAGE_KEY);
    const parsedTasks = savedTasks ? JSON.parse(savedTasks) : [];

    if (Array.isArray(parsedTasks)) {
        tasks = parsedTasks.filter(task =>
            task &&
            typeof task.id === "number" &&
            typeof task.name === "string" &&
            ["Low", "Medium", "High"].includes(task.priority) &&
            typeof task.completed === "boolean"
        );
    }
} catch (error) {
    tasks = [];
}

// Add a new task
taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const taskName = taskInput.value.trim();
    const priority = priorityInput.value;

    if (!taskName) {
        return;
    }

    const newTask = {
        id: Date.now(),
        name: taskName,
        priority: priority,
        completed: false
    };

    tasks.push(newTask);

    saveTasks();
    renderTasks();

    taskForm.reset();
    priorityInput.value = "Medium";
    taskInput.focus();
});

// Save tasks to browser storage
function saveTasks() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
        alert("Unable to save tasks in this browser.");
    }
}

// Display tasks
function renderTasks() {
    taskList.replaceChildren();

    if (tasks.length === 0) {
        const message = document.createElement("p");
        message.className = "empty-message";
        message.textContent = "No tasks yet. Add your first task!";
        taskList.appendChild(message);
    }

    tasks.forEach(function (task) {
        const taskItem = document.createElement("div");
        taskItem.className = "task-item";

        if (task.completed) {
            taskItem.classList.add("completed");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute(
            "aria-label",
            "Mark " + task.name + " as completed"
        );

        checkbox.addEventListener("change", function () {
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        const details = document.createElement("div");
        details.className = "task-details";

        const name = document.createElement("div");
        name.className = "task-name";
        name.textContent = task.name;

        const meta = document.createElement("div");
        meta.className = "task-meta";

        const priority = document.createElement("span");
        priority.className = "priority " + task.priority;
        priority.textContent = task.priority + " Priority";

        meta.appendChild(priority);
        details.append(name, meta);

        const completeButton = document.createElement("button");
        completeButton.className = "complete-button";
        completeButton.textContent = task.completed
            ? "Undo"
            : "Complete";

        completeButton.addEventListener("click", function () {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        });

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function () {
            const confirmed = confirm(
                "Are you sure you want to delete this task?"
            );

            if (confirmed) {
                tasks = tasks.filter(item => item.id !== task.id);
                saveTasks();
                renderTasks();
            }
        });

        taskItem.append(
            checkbox,
            details,
            completeButton,
            deleteButton
        );

        taskList.appendChild(taskItem);
    });

    updateSummary();
}

// Update task counts and project progress
function updateSummary() {
    const total = tasks.length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const remaining = total - completed;

    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    totalTasks.textContent = total;
    completedTasks.textContent = completed;
    remainingTasks.textContent = remaining;

    progressText.textContent = percentage + "%";
    progressBar.style.width = percentage + "%";
    progressBar.setAttribute("role", "progressbar");
    progressBar.setAttribute("aria-valuenow", percentage);
    progressBar.setAttribute("aria-valuemin", 0);
    progressBar.setAttribute("aria-valuemax", 100);
}

// Show saved tasks when the application opens
renderTasks();
