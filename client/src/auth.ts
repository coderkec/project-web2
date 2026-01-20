// export function isLoggedIn(): boolean {
//   return localStorage.getItem("loggedIn") === "true";
// }

// export function login() {
//   localStorage.setItem("loggedIn", "true");
// }

// export function logout() {
//   localStorage.removeItem("loggedIn");
// }

const KEY = "isLoggedIn";

export const login = () => {
  localStorage.setItem(KEY, "true");
};

export const logout = () => {
  localStorage.removeItem(KEY);
};

export const isLoggedIn = () => {
  return localStorage.getItem(KEY) === "true";
};

export const checkAuth = () => {
  return new Promise<boolean>((resolve) => {
    setTimeout(() => {
      resolve(localStorage.getItem("isLoggedIn") === "true");
    }, 400); // 👈 체감 최적 구간
  });
};
