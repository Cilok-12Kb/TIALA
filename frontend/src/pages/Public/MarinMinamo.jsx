import { useState } from "react";
import PublicNavbar from "../../components/PublicNavbar";

export default function MarinMinamo() {

  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");

  const sendMessage = async () => {

    const response = await fetch(
        "http://127.0.0.1:8000/api/chat",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                message: message
            })
        }
    );

    const data = await response.json();

    console.log(data);

    setReply(data.reply);
  };

  return (
    <>
      <PublicNavbar />

      <div className="container mt-5">

        <h1>🤖 Marin Minamo</h1>

        <textarea
          className="form-control"
          rows="4"
          value={message}
          onChange={(e)=>setMessage(e.target.value)}
        />

        <button
          className="btn btn-primary mt-3"
          onClick={sendMessage}
        >
          Kirim
        </button>

        <div className="card mt-4 p-3">
          <strong>Jawaban:</strong>
          <p>{reply}</p>
        </div>

      </div>
    </>
  );
}