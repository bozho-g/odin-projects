export default class Task {
    constructor(title, dueDate, description, priority, projectId, completed = false, id = crypto.randomUUID()) {
        this.id = id;
        this.projectId = projectId;
        this.title = title;
        this.date = dueDate ? new Date(dueDate) : null;
        this.description = description;
        this.priority = priority;
        this.completed = completed;
    }
}