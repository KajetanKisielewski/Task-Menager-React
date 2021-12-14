import React from 'react';
import Api from '../Api';

export default class TasksManager extends React.Component {
    constructor() {
        super();
        this.api = new Api();
    }
    state = {
        tasks: [],
        text: '',
    }

    render() {

        const { text } = this.state;

        return (
            <section className="task__app">
                <h1 className="task__app--title">Welcome to Tasks Manager</h1>
                <section className="task__app--form">
                    <form className="form__wrapper" onSubmit={this.handleSubmit}>
                        <input
                            className="form__input"
                            placeholder="Tell me what are you planning"
                            value={text}
                            type="text"
                            name="text"
                            onChange={this.handleChange}
                        />
                        <button type="submit" className="form__submit">Add A Task!</button>
                    </form>
                </section>
                <main className="task__app--content">
                    {this.renderTasksList()};
                </main>
            </section>
        )
    }

    componentDidMount() {
        this.loadApiData();
    };

    loadApiData = () => {
        return this.api.loadData()
            .then(data => this.setState({ tasks: [...data] }))
            .catch(err => console.log(err))
    };

    renderTasksList = () => {

        const activeTasks = this.state.tasks.filter(task => task.isRemoved === false);
        const sortedTasks = this.sortedTasks(activeTasks)

        return sortedTasks.map(task => {
            return (
                this.createTaskTemplate(task)
            );
        });
    };

    createTaskTemplate = (task) => {

        return (
            <section className="content__task">
                <header className={this.setTaskClassHeader(task)}>
                    <span className="task__header--name"> {task.name} </span>
                    <span className="task__header--time"><i className="icon far fa-clock"></i> {task.time} </span>
                </header>
                <footer className={this.setTaskClassFooter(task)}>
                    <button
                        className="footer__button"
                        onClick={() => this.startTask(task.id)}
                        disabled={this.setTimeButtonDisable(task, false)}
                    >
                        <i className={this.setStartIconClass(task)}></i>
                    </button>
                    <button
                        className="footer__button"
                        onClick={() => this.stopTask(task.id)}
                        disabled={!this.setTimeButtonDisable(task, true)}
                    >
                        <i className={this.setStopIconClass(task)}></i>
                    </button>
                    <button
                        className="footer__button"
                        onClick={() => { this.doneTask(task.id) }}
                        disabled={this.setDoneButtonDisable(task)}
                    >
                        <i className={this.setDoneIconClass(task)}></i>
                    </button>
                    <button
                        className="footer__button"
                        onClick={() => { this.delateTask(task.id) }}
                        disabled={this.setDelateButtonDisable(task)}
                    >
                        <i className={this.setDelateIconClass(task)}></i>
                    </button>
                </footer>
            </section>
        );
    };

    setTaskClassHeader = (task) => {
        if (task.isDone === false) { return "task__header" }
        return "task__header task__header--done"
    }

    setTaskClassFooter = (task) => {
        if (task.isDone === false) { return "task__footer" }
        return "task__footer task__footer--done"
    }

    setStartIconClass = (task) => {
        if (task.isRunning === false && task.isDone === true) { return "icon fas fa-play icon--inactive" }
        else if (task.isRunning === true) { return "icon fas fa-play icon--inactive" }
        return "icon fas fa-play"
    }

    setStopIconClass = (task) => {
        if (task.isRunning === true) { return "icon fas fa-stop" }
        return "icon fas fa-stop icon--inactive"
    }

    setDoneIconClass = (task) => {
        if (task.isRunning === true || task.time > 0) { return "icon fas fa-check" }
        return "icon fas fa-check icon--inactive"
    }

    setDelateIconClass = (task) => {
        if (task.isDone === true) { return "icon fas fa-trash" }
        return "icon fas fa-trash icon--inactive"
    }

    setStartButtonDisable = (task) => {
        return (this.idInterval && task.isRunning === false || task.isDone === true) ? true : false;
    }

    setTimeButtonDisable = (task, isRunningValue) => {
        if (this.idInterval && task.isRunning === isRunningValue || task.isDone === true) { return true }
        else if (task.isRunning === true) { return true }
    }

    setDoneButtonDisable = (task) => {
        return (this.idInterval && task.isRunning === true || task.time > 0) ? false : true;
    }

    setDelateButtonDisable = (task) => {
        return (task.isDone === true) ? false : true;
    }

    sortedTasks = (task) => {
        return task.sort((a, b) => a.isDone - b.isDone)
    }

    doneTask = (id) => {
        this.setState(state => {
            const newTask = state.tasks.map(task => {
                if (task.id === id && task.time > 0) {
                    const doneTask = { ...task, isDone: true };
                    this.updateApiData(doneTask)
                    return doneTask;
                }
                return task;
            })
            return {
                tasks: newTask,
            }
        })
        this.stopTask(id)
    }

    delateTask = (id) => {
        this.setState(state => {
            const newTask = state.tasks.map(task => {
                if (task.id === id && task.isDone === true) {
                    const delateTask = { ...task, isRemoved: true };
                    this.updateApiData(delateTask)
                    return delateTask;
                }
                return task;
            })
            return {
                tasks: newTask,
            }
        })
    }

    startTask = (id) => {
        this.idInterval = setInterval(() => {
            this.incrementTime(id, true, 1)
        }, 1000);
    }

    stopTask = (id) => {
        clearInterval(this.idInterval);
        this.incrementTime(id, false, 0)
        this.idInterval = null;

    }

    incrementTime(id, isRunningValue, incrementValue) {
        this.setState(state => {
            const newTasks = state.tasks.map(task => {
                if (task.id === id) {
                    const updateTask = { ...task, time: task.time + incrementValue, isRunning: isRunningValue };
                    this.updateApiData(updateTask);
                    return updateTask;
                }
                return task;
            });
            return {
                tasks: newTasks,
            }
        });
    }

    updateApiData = (task) => {
        this.api.updateData(task, task.id)
            .then(() => this.loadApiData())
    }

    handleSubmit = (e) => {
        e.preventDefault();

        const { text } = this.state;
        const taskName = this.removeTheSpace(text);

        if (this.textValidation(taskName)) {

            const newTask = this.createNewTask(taskName);

            this.api.addData(newTask)
                .then(() => this.setState({ ...this.state.tasks, newTask }))
                .then(() => this.loadApiData());
        };
    };


    handleChange = (e) => {
        this.setState({
            text: e.target.value,
        });
    };


    createNewTask(taskName) {
        return {
            name: taskName,
            time: 0,
            isRunning: false,
            isDone: false,
            isRemoved: false
        };
    };


    textValidation(text) {
        return text.length > 3;
    };


    removeTheSpace(text) {
        text = text.match(/\S+/g);
        return text ? text.join(' ') : '';
    };
}
