import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

import bmkgLogo from "../../assets/images/Logo.jpg";
import bgLogin from "../../assets/images/bg-login.avif";

export default function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {

    e.preventDefault();

    try {

      const response = await api.post(
        "/ocean-control-center/login",
        {
          email,
          password,
        }
      );

      localStorage.setItem(
        "token",
        response.data.token
      );

      localStorage.setItem(
        "role",
        response.data.role[0]
      );

      navigate("/ocean-dashboard");

    } catch (error) {

      alert("Email atau password salah");

      console.log(error);

    }
  };

  useEffect(() => {

    const token = localStorage.getItem("token");

    if (token) {
      navigate("/ocean-dashboard");
    }

  }, []);

  return (

    <div
      className="
        min-h-screen
        flex
        items-center
        justify-center
        relative
        overflow-hidden
        px-5
        bg-cover
        bg-center
        bg-no-repeat
      "
      style={{
        backgroundImage: `url(${bgLogin})`,
      }}
    >

      {/* Dark Overlay */}
      <div className="
        absolute
        inset-0
        bg-black/30
        backdrop-blur-[2px]
      " />

      {/* Background Glow */}
      <div className="
        absolute
        w-[500px]
        h-[500px]
        bg-sky-300/30
        rounded-full
        blur-[160px]
        top-[-150px]
        left-[-150px]
      " />

      <div className="
        absolute
        w-[500px]
        h-[500px]
        bg-emerald-300/30
        rounded-full
        blur-[160px]
        bottom-[-150px]
        right-[-150px]
      " />

      {/* Gradient Border */}
      <div className="
        relative
        w-full
        max-w-[420px]
        rounded-[38px]
        p-[2px]
        bg-gradient-to-br
        from-sky-400
        via-white
        to-emerald-400
        shadow-[0_10px_40px_rgba(31,38,135,0.20)]
        hover:scale-[1.01]
        transition-all
        duration-500
      ">

        {/* Glass Card */}
        <div className="
          relative
          rounded-[36px]
          bg-white/5
          backdrop-blur-2xl
          border
          border-white/20
          overflow-hidden
        ">

          {/* Inner Light */}
          <div className="
            absolute
            inset-0
            bg-gradient-to-br
            from-white/30
            via-white/10
            to-transparent
            pointer-events-none
          " />

          {/* Content */}
          <div className="relative z-10 px-8 py-10">

            {/* Logo */}
            <div className="flex justify-center mb-4">

              <div className="
                w-24
                h-24
                rounded-full
                bg-white
                backdrop-blur-xl
                flex
                items-center
                justify-center
                shadow-lg
                border
                border-white/10
              ">

                <img
                  src={bmkgLogo}
                  alt="BMKG Logo"
                  className="w-16 h-16 object-contain"
                />

              </div>

            </div>

            {/* Title */}
            <div className="text-center mb-8">

              <h1 className="
                text-4xl
                font-bold
                text-sky-950
                tracking-tight
              ">
                My Ocean
              </h1>

              <p className="
                text-sm
                text-sky-900/70
                mt-2
              ">
                Ocean Control Center BMKG
              </p>

            </div>

            {/* Form */}
            <form onSubmit={handleLogin}>

              {/* Email */}
              <div className="mb-5">

                <label className="
                  text-sm
                  font-semibold
                  text-sky-950
                ">
                  Email
                </label>

                <input
                  type="email"
                  placeholder="Masukkan email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  className="
                    w-full
                    mt-2
                    px-4
                    py-3
                    rounded-2xl
                    bg-white/20
                    backdrop-blur-md
                    border
                    border-white/30
                    outline-none
                    text-sky-950
                    placeholder:text-sky-700/50
                    focus:ring-2
                    focus:ring-sky-400/50
                    focus:border-sky-300
                    transition-all
                  "
                />

              </div>

              {/* Password */}
              <div className="mb-7">

                <label className="
                  text-sm
                  font-semibold
                  text-sky-950
                ">
                  Password
                </label>

                <input
                  type="password"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  className="
                    w-full
                    mt-2
                    px-4
                    py-3
                    rounded-2xl
                    bg-white/20
                    backdrop-blur-md
                    border
                    border-white/30
                    outline-none
                    text-sky-950
                    placeholder:text-sky-700/50
                    focus:ring-2
                    focus:ring-emerald-400/50
                    focus:border-emerald-300
                    transition-all
                  "
                />

              </div>

              {/* Button */}
              <button
                type="submit"
                className="
                  w-full
                  py-3.5
                  rounded-2xl
                  bg-gradient-to-r
                  from-sky-500
                  to-emerald-500
                  text-white
                  font-semibold
                  text-lg
                  shadow-lg
                  shadow-sky-500/20
                  hover:scale-[1.02]
                  hover:shadow-emerald-400/30
                  active:scale-[0.98]
                  transition-all
                  duration-300
                "
              >
                Login
              </button>

            </form>

          </div>

        </div>

      </div>

    </div>

  );
}