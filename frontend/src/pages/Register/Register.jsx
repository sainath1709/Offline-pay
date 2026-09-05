import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./Register.css";
import { Link } from "react-router-dom";
const Register = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: ""
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            const res = await API.post(
                "/auth/register",
                formData
            );

            console.log(res.data);

            alert("Registration successful");
            navigate("/login");

        } catch(error){

            console.log(error.response?.data || error);
            alert(error.response?.data?.message || "Registration failed");

        }
    };

    return (
        <div className="register-container">

            <form className="register-card" onSubmit={handleSubmit}>

                <h2>Create Account</h2>

                <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleChange}
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                />


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
  Register
</button>

<p className="text-center text-gray-400 mt-6">
  Already have an account?{" "}
  <Link
    to="/"
    className="text-violet-400 hover:text-violet-300 font-semibold"
  >
    Login
  </Link>
</p>
            </form>

        </div>
    )
}


export default Register;