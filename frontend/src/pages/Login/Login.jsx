import { useState } from "react";
import "./Login.css";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import API from "../../services/api";
const Login = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        phone: "",
        password: ""
    });
    useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/");
    }
  }, [navigate]);


    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await API.post("/auth/login", formData);

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    navigate("/dashboard");

  } catch (error) {
    alert(error.response?.data?.message || "Login failed");
    console.log(error.response?.data);
  }
};
    return (
        <div className="login-container">

            <form onSubmit={handleSubmit}>

                <h2>Login</h2>

                <input
                    type="text"
                    name="phone"
                    placeholder="Phone"
                    onChange={handleChange}
                />


                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    onChange={handleChange}
                />


            <button
  type="submit"
  className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl mt-6"
>
  Login
</button>

<p className="text-center text-gray-400 mt-6">
  Don't have an account?{" "}
  <Link
    to="/register"
    className="text-violet-400 hover:text-violet-300 font-semibold"
  >
    Register
  </Link>
</p>
            </form>

        </div>
    );
};


export default Login;