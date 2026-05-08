const h = TinyReact.createElement;
"use strict";
(() => {
  const { createElement: h, render, useState, useEffect } = TinyReact;
  const TodoApp = () => {
    const [todos, setTodos] = useState([
      { id: 1, text: "Learn Virtual DOM", done: true },
      { id: 2, text: "Implement Diff Algorithm", done: true },
      { id: 3, text: "Add Hooks (useState / useEffect)", done: true },
      { id: 4, text: "Build a TodoList with TinyReact", done: false }
    ]);
    const [filter, setFilter] = useState("all");
    const [input, setInput] = useState("");
    useEffect(() => {
      document.title = `TinyReact \u2014 ${todos.filter((t) => !t.done).length} items left`;
    }, [todos]);
    const filtered = todos.filter((t) => {
      if (filter === "active") return !t.done;
      if (filter === "completed") return t.done;
      return true;
    });
    const addTodo = () => {
      const text = input.trim();
      if (!text) return;
      setTodos((prev) => [...prev, { id: Date.now(), text, done: false }]);
      setInput("");
    };
    const toggle = (id) => {
      setTodos((prev) => prev.map(
        (t) => t.id === id ? { ...t, done: !t.done } : t
      ));
    };
    const remove = (id) => {
      setTodos((prev) => prev.filter((t) => t.id !== id));
    };
    const handleKeyDown = (e) => {
      if (e.key === "Enter") addTodo();
    };
    return /* @__PURE__ */ h("div", { className: "app" }, /* @__PURE__ */ h("header", null, /* @__PURE__ */ h("h1", null, "TinyReact TodoList"), /* @__PURE__ */ h("p", { className: "subtitle" }, "A React-like framework from scratch (~600 LOC)")), /* @__PURE__ */ h("div", { className: "input-row" }, /* @__PURE__ */ h(
      "input",
      {
        type: "text",
        className: "todo-input",
        value: input,
        placeholder: "What needs to be done?",
        onInput: (e) => setInput(e.target.value),
        onKeyDown: handleKeyDown
      }
    ), /* @__PURE__ */ h("button", { className: "btn-add", onClick: addTodo }, "Add")), /* @__PURE__ */ h("div", { className: "filters" }, /* @__PURE__ */ h(
      "button",
      {
        className: filter === "all" ? "active" : "",
        onClick: () => setFilter("all")
      },
      "All (",
      todos.length,
      ")"
    ), /* @__PURE__ */ h(
      "button",
      {
        className: filter === "active" ? "active" : "",
        onClick: () => setFilter("active")
      },
      "Active (",
      todos.filter((t) => !t.done).length,
      ")"
    ), /* @__PURE__ */ h(
      "button",
      {
        className: filter === "completed" ? "active" : "",
        onClick: () => setFilter("completed")
      },
      "Completed (",
      todos.filter((t) => t.done).length,
      ")"
    )), /* @__PURE__ */ h("ul", { className: "todo-list" }, filtered.length === 0 ? /* @__PURE__ */ h("li", { className: "empty" }, "No tasks here. Add one above.") : filtered.map(
      (todo) => /* @__PURE__ */ h("li", { key: todo.id, className: todo.done ? "done" : "" }, /* @__PURE__ */ h(
        "input",
        {
          type: "checkbox",
          checked: todo.done,
          onChange: () => toggle(todo.id)
        }
      ), /* @__PURE__ */ h("span", { className: "text" }, todo.text), /* @__PURE__ */ h("button", { className: "btn-delete", onClick: () => remove(todo.id) }, "\xD7"))
    )), /* @__PURE__ */ h("footer", null, /* @__PURE__ */ h("span", { className: "counter" }, todos.filter((t) => !t.done).length, " items left"), todos.some((t) => t.done) && /* @__PURE__ */ h("button", { className: "btn-clear", onClick: () => setTodos((prev) => prev.filter((t) => !t.done)) }, "Clear completed")));
  };
  const root = document.getElementById("root");
  render(/* @__PURE__ */ h(TodoApp, null), root);
})();
