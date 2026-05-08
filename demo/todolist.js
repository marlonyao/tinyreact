const h = TinyReact.createElement;
"use strict";
(() => {
  const { createElement: h, render, useState, useEffect } = TinyReact;
  const TodoHeader = () => /* @__PURE__ */ h("header", null, /* @__PURE__ */ h("h1", null, "TinyReact TodoList"), /* @__PURE__ */ h("p", { className: "subtitle" }, "A React-like framework from scratch (~600 LOC)"));
  const TodoInput = (props) => /* @__PURE__ */ h("div", { className: "input-row" }, /* @__PURE__ */ h(
    "input",
    {
      type: "text",
      className: "todo-input",
      value: props.value,
      placeholder: "What needs to be done?",
      onInput: props.onInput,
      onKeyDown: props.onKeyDown
    }
  ), /* @__PURE__ */ h("button", { className: "btn-add", onClick: props.onAdd }, "Add"));
  const TodoFilters = (props) => /* @__PURE__ */ h("div", { className: "filters" }, /* @__PURE__ */ h(
    "button",
    {
      className: props.filter === "all" ? "active" : "",
      onClick: () => props.onFilterChange("all")
    },
    "All (",
    props.total,
    ")"
  ), /* @__PURE__ */ h(
    "button",
    {
      className: props.filter === "active" ? "active" : "",
      onClick: () => props.onFilterChange("active")
    },
    "Active (",
    props.active,
    ")"
  ), /* @__PURE__ */ h(
    "button",
    {
      className: props.filter === "completed" ? "active" : "",
      onClick: () => props.onFilterChange("completed")
    },
    "Completed (",
    props.completed,
    ")"
  ));
  const TodoItem = (props) => /* @__PURE__ */ h("li", { key: props.todo.id, className: props.todo.done ? "done" : "" }, /* @__PURE__ */ h(
    "input",
    {
      type: "checkbox",
      checked: props.todo.done,
      onChange: () => props.onToggle(props.todo.id)
    }
  ), /* @__PURE__ */ h("span", { className: "text" }, props.todo.text), /* @__PURE__ */ h("button", { className: "btn-delete", onClick: () => props.onRemove(props.todo.id) }, "\xD7"));
  const TodoList = (props) => /* @__PURE__ */ h("ul", { className: "todo-list" }, props.items.length === 0 ? /* @__PURE__ */ h("li", { className: "empty" }, "No tasks here. Add one above.") : props.items.map(
    (todo) => /* @__PURE__ */ h(
      TodoItem,
      {
        key: todo.id,
        todo,
        onToggle: props.onToggle,
        onRemove: props.onRemove
      }
    )
  ));
  const TodoFooter = (props) => /* @__PURE__ */ h("footer", null, /* @__PURE__ */ h("span", { className: "counter" }, props.remaining, " items left"), props.hasCompleted && /* @__PURE__ */ h("button", { className: "btn-clear", onClick: props.onClearCompleted }, "Clear completed"));
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
    const remaining = todos.filter((t) => !t.done).length;
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
    const clearCompleted = () => {
      setTodos((prev) => prev.filter((t) => !t.done));
    };
    const handleKeyDown = (e) => {
      if (e.key === "Enter") addTodo();
    };
    return /* @__PURE__ */ h("div", { className: "app" }, /* @__PURE__ */ h(TodoHeader, null), /* @__PURE__ */ h(
      TodoInput,
      {
        value: input,
        onInput: (e) => setInput(e.target.value),
        onKeyDown: handleKeyDown,
        onAdd: addTodo
      }
    ), /* @__PURE__ */ h(
      TodoFilters,
      {
        filter,
        total: todos.length,
        active: remaining,
        completed: todos.filter((t) => t.done).length,
        onFilterChange: setFilter
      }
    ), /* @__PURE__ */ h(
      TodoList,
      {
        items: filtered,
        onToggle: toggle,
        onRemove: remove
      }
    ), /* @__PURE__ */ h(
      TodoFooter,
      {
        remaining,
        hasCompleted: todos.some((t) => t.done),
        onClearCompleted: clearCompleted
      }
    ));
  };
  const root = document.getElementById("root");
  render(/* @__PURE__ */ h(TodoApp, null), root);
})();
