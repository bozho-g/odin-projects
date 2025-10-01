import { format, isToday, isThisWeek } from "https://esm.sh/date-fns";
import Task from "./models/task.js";
import Project from "./models/project.js";
import StorageController from "./storageController.js";

const tasksDiv = document.querySelector('.tasks');
const projectsList = document.querySelector('.projects');
const divPopup = document.querySelector('.form-popup');

let isEdit = false;
let editingId = null;

let forms = {
    tasks: document.querySelector('#addTask'),
    projects: document.querySelector('#addProject')
};

function dueDateToString(date) {
    return format(date, 'MMM dd, yyyy');
}

function renderProject(proj, isActive) {
    let activeProjId = isActive?.dataset.id;
    const projListItem = document.createElement('li');

    const projectBtn = document.createElement('button');
    projectBtn.classList.add('project', 'item', 'nav-btn');

    if (isActive && proj.id === activeProjId) {
        projectBtn.classList.add('active');
    }

    const projectDiv = document.createElement('div');
    const hash = document.createElement('span');
    hash.textContent = "#";
    hash.classList.add('hash');
    hash.style.color = proj.getColor();

    const titleText = document.createTextNode(`${proj.title}`);
    projectDiv.appendChild(hash);
    projectDiv.appendChild(titleText);

    projectBtn.appendChild(projectDiv);
    projectBtn.dataset.id = proj.id;

    const projectActions = document.createElement('div');
    projectActions.classList.add("project-actions");
    projectActions.innerHTML += `
        <svg data-add="project" class="edit" width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M20.1498 7.93997L8.27978 19.81C7.21978 20.88 4.04977 21.3699 3.32977 20.6599C2.60977 19.9499 3.11978 16.78 4.17978 15.71L16.0498 3.84C16.5979 3.31801 17.3283 3.03097 18.0851 3.04019C18.842 3.04942 19.5652 3.35418 20.1004 3.88938C20.6356 4.42457 20.9403 5.14781 20.9496 5.90463C20.9588 6.66146 20.6718 7.39189 20.1498 7.93997V7.93997Z" stroke="#currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
        <svg class="delete" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M10 12V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M14 12V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M4 7H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M6 10V18C6 19.6569 7.34315 21 9 21H15C16.6569 21 18 19.6569 18 18V10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>`;

    projectActions.addEventListener("click", handleUpdateDelete);

    projectBtn.appendChild(projectActions);
    projListItem.appendChild(projectBtn);

    const optionElement = document.createElement("option");
    optionElement.value = proj.id;
    optionElement.textContent = proj.title;

    return [projListItem, optionElement];
}

function showProjects() {
    let projectsSelect = forms.tasks.querySelector("#projectId");
    let isActive = document.querySelector('.project.active');
    projectsList.innerHTML = '';
    projectsSelect.innerHTML = '';

    projects.forEach(proj => {
        let [element, option] = renderProject(proj, isActive);
        projectsList.appendChild(element);
        projectsSelect.appendChild(option);
    });
}

function showTasks() {
    tasksDiv.innerHTML = '';

    let filteredTasks = filterTasks();

    filteredTasks.forEach(task => {
        tasksDiv.appendChild(renderTask(task));
    });
}

function renderTask(task) {
    let proj = projects[getObjIdByElement(task.projectId, projects)];
    const taskDiv = document.createElement('div');
    taskDiv.classList.add('task', 'item');
    taskDiv.dataset.id = task.id;

    const checkBox = document.createElement('input');
    checkBox.type = "checkbox";
    checkBox.checked = task.completed;

    const priorityEl = document.createElement('div');
    priorityEl.classList.add('priority-circle');
    priorityEl.classList.add(task.priority.toLowerCase());

    const taskInfoDiv = document.createElement('div');
    taskInfoDiv.classList.add('task-info');

    const titleEl = document.createElement('h3');
    titleEl.textContent = task.title;

    const descriptionEl = document.createElement('p');
    descriptionEl.textContent = task.description;

    const dateEl = document.createElement('p');
    dateEl.textContent = dueDateToString(task.date);

    const projectEl = document.createElement('div');
    const projectTitle = document.createTextNode(`${proj.title}`);
    projectEl.classList.add('project-name');

    const hash = document.createElement('span');
    hash.textContent = "#";
    hash.classList.add('hash');
    hash.style.color = proj.getColor();

    projectEl.appendChild(projectTitle);
    projectEl.appendChild(hash);

    const taskActions = document.createElement('div');
    taskActions.classList.add("task-actions");
    taskActions.innerHTML += `<svg class="delete" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M10 12V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M14 12V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M4 7H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M6 10V18C6 19.6569 7.34315 21 9 21H15C16.6569 21 18 19.6569 18 18V10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
        <svg data-add="task" class="edit" width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21.2799 6.40005L11.7399 15.94C10.7899 16.89 7.96987 17.33 7.33987 16.7C6.70987 16.07 7.13987 13.25 8.08987 12.3L17.6399 2.75002C17.8754 2.49308 18.1605 2.28654 18.4781 2.14284C18.7956 1.99914 19.139 1.92124 19.4875 1.9139C19.8359 1.90657 20.1823 1.96991 20.5056 2.10012C20.8289 2.23033 21.1225 2.42473 21.3686 2.67153C21.6147 2.91833 21.8083 3.21243 21.9376 3.53609C22.0669 3.85976 22.1294 4.20626 22.1211 4.55471C22.1128 4.90316 22.0339 5.24635 21.8894 5.5635C21.7448 5.88065 21.5375 6.16524 21.2799 6.40005V6.40005Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M11 4H6C4.93913 4 3.92178 4.42142 3.17163 5.17157C2.42149 5.92172 2 6.93913 2 8V18C2 19.0609 2.42149 20.0783 3.17163 20.8284C3.92178 21.5786 4.93913 22 6 22H17C19.21 22 20 20.2 20 18V13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        `;

    checkBox.addEventListener('change', handleUpdateDelete);
    taskActions.addEventListener("click", handleUpdateDelete);

    taskInfoDiv.append(titleEl, dateEl, descriptionEl, projectEl);

    taskDiv.append(checkBox, priorityEl, taskInfoDiv, taskActions);
    return taskDiv;
}

function handleForms(e) {
    e.preventDefault();
    let form = e.target;
    let isTask = form.id === "addTask";
    let collection = isTask ? tasks : projects;
    let obj = isTask ? new Task() : new Project();

    const formData = new FormData(form);

    if (!isEdit) {
        for (const [key, value] of formData.entries()) {
            obj[key] = key == "date" ? new Date(value) : value;
        }

        collection.push(obj);
    } else {
        obj = collection[editingId];

        Object.entries(obj).forEach(([key, value]) => {
            if (!key.includes('id') && key != 'tasks' && key != 'completed') {
                let newValue = formData.get(key);

                obj[key] = key == "date" ? new Date(newValue) : newValue;
            }
        });

        isEdit = false;
        editingId = null;
    }

    form.querySelector('.close').click();
    form.reset();
    render();
    if (!isTask) {
        document.querySelector(`.project[data-id="${obj.id}"`).click();
    }
}

function getObjIdByElement(id, array) {
    return array.findIndex(t => t.id == id);
}

function handleUpdateDelete(e) {
    let element = e.target.closest(".item");
    let isTask = element.classList.contains('task');
    let collection = isTask ? tasks : projects;
    let objId = getObjIdByElement(element.dataset.id, collection);
    let obj = collection[objId];

    let targetClosest = e.target.closest('svg');

    if (targetClosest) {
        if (targetClosest.classList.contains("delete")) {
            collection.splice(objId, 1);

            if (!isTask) {
                tasks = tasks.filter(x => x.projectId != element.dataset.id);
                tasks._name = "tasks";
            }
        } else if (targetClosest.classList.contains("edit")) {
            isEdit = true;
            editingId = objId;

            let date = obj.date;
            let dateFormatted;
            if (date) {
                dateFormatted = date.getFullYear().toString().padStart(4, '0') + '-' + (date.getMonth() + 1).toString().padStart(2, '0') + '-' + date.getDate().toString().padStart(2, '0');
            }

            Object.entries(obj).forEach(([key, value]) => {
                if (!key.includes('id') && key != 'tasks' && key != 'completed') {
                    forms[collection._name].querySelector(`[name='${key}'`).value = key === 'date' ? dateFormatted : obj[key];
                }
            });

            return;
        }
    } else {
        obj.completed = e.target.checked;
    }

    render();
}

function filterTasks() {
    let activeButton = document.querySelector('.active');
    let filter = activeButton?.dataset.id;

    return tasks.filter(t => {
        let date = t.date;

        if (filter == "today") {
            return isToday(date);
        }

        if (filter == "week") {
            return isThisWeek(date);
        }

        if (filter == "completed") {
            return t.completed;
        }

        if (filter == "all") {
            return true;
        }

        return t.projectId == filter;
    });
}

function toggleFormEvents(e) {
    divPopup.classList.toggle('show');

    if (e.target.closest('[data-add]').dataset.add === "task") {
        forms.tasks.classList.toggle('show');
    } else {
        forms.projects.classList.toggle('show');
    }

    if (e.target.classList.contains('close')) {
        e.target.form.reset();
        isEdit = false;
        editingId = null;
    }
}

function toggleActiveFilter(e) {
    if (e.target.tagName !== "svg" && e.target.tagName !== "path") {
        document.querySelector('.active')?.classList.remove('active');

        e.target.closest('.nav-btn').classList.add('active');
    }

    render();
}

function render() {
    showProjects();
    showTasks();
    StorageController.saveState({ projects, tasks });
    initEventListeners();
}

function initEventListeners() {
    Object.entries(forms).forEach(form => {
        form[1].addEventListener('submit', handleForms);
    });

    document.querySelectorAll('.nav-btn').forEach(x => x.addEventListener('click', toggleActiveFilter));
    document.querySelectorAll('[data-add]').forEach(x => x.addEventListener('click', toggleFormEvents));
}

let { projects, tasks } = StorageController.loadState();
render();