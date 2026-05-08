var h = TinyReact.createElement;
var HashRouter = TinyReact.HashRouter;
var Route = TinyReact.Route;
var Link = TinyReact.Link;
var useRouter = TinyReact.useRouter;
var useState = TinyReact.useState;
const Home = () => /* @__PURE__ */ h("div", { className: "page" }, /* @__PURE__ */ h("h1", null, "\u{1F3E0} Home"), /* @__PURE__ */ h("p", null, "Welcome to TinyReact Router Demo!"), /* @__PURE__ */ h("p", null, "This is a single-page application with client-side routing."), /* @__PURE__ */ h("div", { className: "card" }, /* @__PURE__ */ h("h3", null, "Features"), /* @__PURE__ */ h("ul", null, /* @__PURE__ */ h("li", null, /* @__PURE__ */ h(Link, { to: "/about" }, "About Page")), /* @__PURE__ */ h("li", null, /* @__PURE__ */ h(Link, { to: "/users" }, "User List")), /* @__PURE__ */ h("li", null, /* @__PURE__ */ h(Link, { to: "/users/42" }, "User #42 Profile")), /* @__PURE__ */ h("li", null, /* @__PURE__ */ h(Link, { to: "/counter" }, "Interactive Counter")))));
const About = () => /* @__PURE__ */ h("div", { className: "page" }, /* @__PURE__ */ h("h1", null, "\u{1F4D6} About"), /* @__PURE__ */ h("p", null, "TinyReact is a minimal React-like framework built from scratch (~600 LOC)."), /* @__PURE__ */ h("p", null, "Router features implemented:"), /* @__PURE__ */ h("ul", null, /* @__PURE__ */ h("li", null, "Hash-based routing (HashRouter)"), /* @__PURE__ */ h("li", null, "Path matching with dynamic params (:id)"), /* @__PURE__ */ h("li", null, "Navigation with Link component"), /* @__PURE__ */ h("li", null, "useRouter() hook for programmatic navigation")), /* @__PURE__ */ h("p", null, /* @__PURE__ */ h(Link, { to: "/" }, "\u2190 Back to Home")));
const UserList = () => {
  const users = [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
    { id: 42, name: "Yao Lei" }
  ];
  return /* @__PURE__ */ h("div", { className: "page" }, /* @__PURE__ */ h("h1", null, "\u{1F465} Users"), /* @__PURE__ */ h("ul", { className: "user-list" }, users.map((user) => /* @__PURE__ */ h("li", { key: user.id }, /* @__PURE__ */ h(Link, { to: `/users/${user.id}` }, user.name)))), /* @__PURE__ */ h("p", null, /* @__PURE__ */ h(Link, { to: "/" }, "\u2190 Back to Home")));
};
const UserProfile = (props) => {
  const users = {
    1: { name: "Alice", role: "Designer" },
    2: { name: "Bob", role: "Developer" },
    42: { name: "Yao Lei", role: "Software Engineer" }
  };
  const userId = props.params.id;
  const user = users[userId];
  if (!user) {
    return /* @__PURE__ */ h("div", { className: "page" }, /* @__PURE__ */ h("h1", null, "\u274C User Not Found"), /* @__PURE__ */ h("p", null, "No user with ID: ", userId), /* @__PURE__ */ h("p", null, /* @__PURE__ */ h(Link, { to: "/users" }, "\u2190 Back to Users")));
  }
  return /* @__PURE__ */ h("div", { className: "page" }, /* @__PURE__ */ h("h1", null, "\u{1F464} ", user.name), /* @__PURE__ */ h("div", { className: "card" }, /* @__PURE__ */ h("p", null, /* @__PURE__ */ h("strong", null, "ID:"), " ", userId), /* @__PURE__ */ h("p", null, /* @__PURE__ */ h("strong", null, "Name:"), " ", user.name), /* @__PURE__ */ h("p", null, /* @__PURE__ */ h("strong", null, "Role:"), " ", user.role)), /* @__PURE__ */ h("p", null, /* @__PURE__ */ h(Link, { to: "/users" }, "\u2190 Back to Users"), " | ", /* @__PURE__ */ h(Link, { to: "/" }, "Home")));
};
const Counter = () => {
  const [count, setCount] = useState(0);
  const router = useRouter();
  return /* @__PURE__ */ h("div", { className: "page" }, /* @__PURE__ */ h("h1", null, "\u{1F522} Counter"), /* @__PURE__ */ h("div", { className: "card counter-card" }, /* @__PURE__ */ h("p", { className: "count" }, count), /* @__PURE__ */ h("div", { className: "counter-buttons" }, /* @__PURE__ */ h("button", { onClick: () => setCount((c) => c - 1) }, "-"), /* @__PURE__ */ h("button", { onClick: () => setCount(0) }, "Reset"), /* @__PURE__ */ h("button", { onClick: () => setCount((c) => c + 1) }, "+")), /* @__PURE__ */ h("p", { className: "route-info" }, "Current route: ", router.path)), /* @__PURE__ */ h("p", null, /* @__PURE__ */ h(Link, { to: "/" }, "\u2190 Back to Home")));
};
const NavBar = () => /* @__PURE__ */ h("nav", { className: "navbar" }, /* @__PURE__ */ h(Link, { to: "/", className: "nav-brand" }, "TinyReact Router"), /* @__PURE__ */ h("div", { className: "nav-links" }, /* @__PURE__ */ h(Link, { to: "/" }, "Home"), /* @__PURE__ */ h(Link, { to: "/about" }, "About"), /* @__PURE__ */ h(Link, { to: "/users" }, "Users"), /* @__PURE__ */ h(Link, { to: "/counter" }, "Counter")));
const App = () => /* @__PURE__ */ h("div", null, /* @__PURE__ */ h(NavBar, null), /* @__PURE__ */ h("main", { className: "main-content" }, /* @__PURE__ */ h(Route, { path: "/", component: Home }), /* @__PURE__ */ h(Route, { path: "/about", component: About }), /* @__PURE__ */ h(Route, { path: "/users", component: UserList }), /* @__PURE__ */ h(Route, { path: "/users/:id", component: UserProfile }), /* @__PURE__ */ h(Route, { path: "/counter", component: Counter })));
const root = document.getElementById("root");
TinyReact.render(
  h(HashRouter, null, h(App, null)),
  root
);
