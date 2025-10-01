import Task from "./models/task.js";
import Project from "./models/project.js";

export default class StorageController {
    constructor() {
    }

    static saveState(state) {
        localStorage.setItem("app", JSON.stringify(state));
    }

    static loadState() {
        let projects = [];
        let tasks = [];

        const stored = localStorage.getItem("app");
        if (stored) {
            const { projects: savedProjects, tasks: savedTasks } = JSON.parse(stored);

            projects = savedProjects.map(p => new Project(p.title, p.id));
            tasks = savedTasks.map(t => new Task(
                t.title, t.date, t.description, t.priority, t.projectId, t.completed
                , t.id));
        } else {
            const defaultProject = new Project("Default Project");
            projects.push(defaultProject);

            tasks.push(
                new Task("Buy groceries", new Date(), "Milk, eggs, bread", "high", defaultProject.id, false),
                new Task("Clean the house", new Date(Date.now() + 3 * 86400000), "Living room & kitchen", "medium", defaultProject.id, false),
                new Task("Read a book", "2025-09-25", "At least 20 pages", "low", defaultProject.id, false)
            );

            StorageController.saveState({ projects, tasks });
        }

        projects._name = 'projects';
        tasks._name = 'tasks';
        return { projects, tasks };
    }

}