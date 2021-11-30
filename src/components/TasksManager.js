import React from 'react';

export default class TasksManager extends React.Component {
    state = {
        tasks: [],
        text: '',
    }

    render() {

        const { text } = this.state;

        return (
            <section className="task">
                <h1 className="task__title">Welcome to Tasks Manager</h1>
                <form className="task__form" onSubmit={this.handleSubmit}>
                    <input
                        className="form__input"
                        placeholder="Add a task!"
                        value={text}
                        type="text"
                        name="text"
                    />
                    <button type='submit' className="form__submit">Add a task!</button>
                </form>
            </section>
        )
    }

    handleSubmit = (e) => {
        e.preventDefault();
    }

    setComment = (e) => {

    }


}
