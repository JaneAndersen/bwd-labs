let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

const elements = {
    addTaskBtn: document.getElementById('addTaskBtn'),
    taskModal: document.getElementById('taskModal'),
    taskForm: document.getElementById('taskForm'),
    taskInput: document.getElementById('taskInput'),
    cancelBtn: document.getElementById('cancelBtn'),
    todoList: document.getElementById('todoList'),
    inProgressList: document.getElementById('inProgressList'),
    doneList: document.getElementById('doneList'),
    sortAscBtn: document.getElementById('sortAscBtn'),
    sortDescBtn: document.getElementById('sortDescBtn')
};

const toggleModal = (isVisible) => {
    elements.taskModal.style.display = isVisible ? 'flex' : 'none';
    if (!isVisible) elements.taskForm.reset();
};

elements.addTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.taskInput.focus();
});

elements.cancelBtn.addEventListener('click', () => toggleModal(false));
elements.taskModal.addEventListener('click', (e) => {
    if (e.target === elements.taskModal) toggleModal(false);
});

elements.taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addTask();
});

elements.taskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        addTask();
    }
});

function addTask() {
    const taskName = elements.taskInput.value.trim();
    if (taskName) {
        const task = { id: Date.now(), name: taskName, status: 'todo' };
        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        addTaskToBoard(task);
        toggleModal(false);
    }
}

window.onload = () => tasks.forEach(addTaskToBoard);

function addTaskToBoard(task) {
    const taskDiv = createTaskElement(task);
    getTaskList(task.status).appendChild(taskDiv);
}

function createTaskElement(task) {
    const taskDiv = document.createElement('div');
    taskDiv.classList.add('task');
    taskDiv.draggable = true;
    taskDiv.dataset.id = task.id;

    const taskText = document.createElement('span');
    taskText.textContent = task.name;
    taskText.classList.add('task-name');
    taskText.addEventListener('dblclick', () => editTask(taskDiv, task));

    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete-btn');
    deleteBtn.innerHTML = '&times;';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    taskDiv.append(taskText, deleteBtn);
    taskDiv.addEventListener('dragstart', dragStart);
    taskDiv.addEventListener('dragend', dragEnd);

    return taskDiv;
}

function editTask(taskDiv, task) {
    const input = document.createElement('textarea');
    input.value = task.name;
    input.classList.add('edit-input');

    input.style.height = '100px'; 

    input.addEventListener('wheel', (e) => {
        if (input.scrollHeight > input.clientHeight) {
        }
    });

    input.addEventListener('blur', () => saveTaskName(input, task, taskDiv));
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveTaskName(input, task, taskDiv);
        }
    });

    taskDiv.innerHTML = '';
    taskDiv.appendChild(input);
    input.focus();
}

function saveTaskName(input, task, taskDiv) {
    const newName = input.value.trim();
    if (newName) task.name = newName;
    localStorage.setItem('tasks', JSON.stringify(tasks));
    taskDiv.replaceWith(createTaskElement(task));
}

function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
}

elements.taskInput.addEventListener('input', () => autoResizeTextarea(elements.taskInput));

document.addEventListener('DOMContentLoaded', () => autoResizeTextarea(elements.taskInput));

function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.id);
    setTimeout(() => e.target.classList.add('dragging'), 0);
}

function dragEnd(e) {
    e.target.classList.remove('dragging');
}

const boards = document.querySelectorAll('.board');
boards.forEach(board => {
    board.addEventListener('dragover', e => e.preventDefault());
    board.addEventListener('drop', dropTask);
});

function dropTask(e) {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const task = tasks.find(t => t.id == id);
    task.status = e.currentTarget.dataset.status;
    localStorage.setItem('tasks', JSON.stringify(tasks));
    e.currentTarget.querySelector('.task-list').appendChild(document.querySelector(`[data-id='${id}']`));
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id != id);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    document.querySelector(`[data-id='${id}']`).remove();
}

function getTaskList(status) {
    return {
        'todo': elements.todoList,
        'in-progress': elements.inProgressList,
        'done': elements.doneList
    }[status];
}

elements.sortAscBtn.addEventListener('click', () => sortTasks(true));
elements.sortDescBtn.addEventListener('click', () => sortTasks(false));

function sortTasks(isAscending) {
    tasks.sort((a, b) => {
        if (isAscending) {
            return a.name.localeCompare(b.name);
        } else {
            return b.name.localeCompare(a.name);
        }
    });

    localStorage.setItem('tasks', JSON.stringify(tasks));
    refreshTaskBoard();
}

function refreshTaskBoard() {
    elements.todoList.innerHTML = '';
    elements.inProgressList.innerHTML = '';
    elements.doneList.innerHTML = '';

    tasks.forEach(addTaskToBoard);
}

window.onload = () => {
    tasks.forEach(addTaskToBoard);
};
