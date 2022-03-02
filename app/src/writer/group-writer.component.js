import { h } from "preact";
import { Writer } from "/src/writer";
import { Navbar } from "/src/navbar";
import { useParams } from "react-router-dom";

export default function GroupWriter() {
  let params = useParams();

  return (
    <main>
      <Navbar />
      <div class="content">
        <article class="mb-3">
          <div class="container pb-3">
            <Writer focus={true} group={params.id} />
          </div>
        </article>
      </div>
    </main>
  );
}
