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
                    { this.renderTasksList() };
                </main>

            </section>
        )
    }

    componentDidMount() {
        this.loadApiData();
    };

    loadApiData = () => {
        return this.api.loadData()
            .then( data => this.setState( { tasks: [...this.state.tasks , data] } ))
            .catch( err => console.log(err) )
    };

    renderTasksList = () => {

        const { tasks } = this.state;
        const tasksList = tasks.reverse();

        if(tasksList.length > 0) {

            return tasksList[0].map( task => {
                return (
                    this.createTaskTemplate(task)
                );
            });
        };
    };


    createTaskTemplate = (task) => {
        return (
            <section className="content__task">
                <header className="task__header">
                    <span className="task__header--name"> {task.name} </span>
                    <span className="task__header--time"><i className="icon far fa-clock"></i> {task.time} </span>
                </header>
                <footer className="task__footer">
                    <button className="footer__button"><i className="icon start fas fa-play"></i></button>
                    <button className="footer__button"><i className="icon fas fa-stop"></i></button>
                    <button className="footer__button" disabled={true}><i className="icon fas fa-trash-alt"></i></button>
                </footer>
            </section>
        );
    };


    handleSubmit = (e) => {
        e.preventDefault();

        const { text } = this.state;
        const taskName = this.removeTheSpace(text);

        if( this.textValidation(taskName) ) {

            const newTask = this.createNewTask(taskName);

            this.api.addData(newTask)
                .then( () => this.loadApiData() );
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
