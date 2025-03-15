import { useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert("Signup successful! Check your email for verification.");
  };

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) alert(error.message);
    else alert("Login successful!");
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <input
        className="border p-2"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="border p-2"
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="bg-blue-500 text-white p-2" onClick={handleSignup}>
        Sign Up
      </button>
      <button className="bg-green-500 text-white p-2" onClick={handleLogin}>
        Login
      </button>
    </div>
  );
}
