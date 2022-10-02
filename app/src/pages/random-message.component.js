import { h } from "preact";
import { http } from "/src/core";
import { useParams, Navigate } from "react-router-dom";
import { useEffect, useState } from "preact/hooks";

export default function RandomMessage() {
  const params = useParams();
  const [message, setMessage] = useState(null);

  useEffect(() => {
    http.get(`/api/groups/${params.id}/random`).then(m => {
      setMessage(m);
    });
  }, []);

  if (message) {
    return <Navigate to={`/messages/${message.id}`} replace={true} />;
  }
}
