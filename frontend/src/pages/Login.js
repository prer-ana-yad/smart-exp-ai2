import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "./Login.css";

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (isSignup) {
        const res = await API.post("/auth/signup", form);
        alert("Signup successful! Please login.");
        setIsSignup(false);
      } else {
        const res = await API.post("/auth/login", {
          email: form.email,
          password: form.password,
        });

        if (!res.data.token) {
          alert("Login failed. No token received.");
          return;
        }

        // Save token properly
        localStorage.setItem("token", res.data.token);

        console.log("TOKEN SAVED:", res.data.token);

        navigate("/home");
      }
    } catch (err) {
      console.log("LOGIN ERROR:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="container">
      <div className="card">

<div className="title-wrapper">
  

  <h1 className="title">ExpensIQ</h1>
</div>

        <div className="toggle">
          <button
            type="button"
            className={!isSignup ? "active" : ""}
            onClick={() => setIsSignup(false)}
          >
            Login
          </button>
          <button
            type="button"
            className={isSignup ? "active" : ""}
            onClick={() => setIsSignup(true)}
          >
            Sign Up
          </button>
        </div>

        {isSignup && (
          <input
            name="fullName"
            placeholder="Full Name"
            onChange={handleChange}
          />
        )}

        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
        />

        {isSignup && (
          <input
            name="phone"
            placeholder="Phone"
            onChange={handleChange}
          />
        )}

        <button
          type="button"
          className="main-btn"
          onClick={handleSubmit}
        >
          {isSignup ? "Sign Up" : "Login"}
        </button>
        <p className="switch-text">
  {isSignup ? (
    <>
      Already have an account?{" "}
      <span onClick={() => setIsSignup(false)}>Login</span>
    </>
  ) : (
    <>
      New user?{" "}
      <span onClick={() => setIsSignup(true)}>Register</span>
    </>
  )}
</p>

      </div>
    </div>
  );
}