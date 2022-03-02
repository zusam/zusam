import { h } from "preact";
import { Navbar, GroupSearch } from "/src/navbar";
import { useParams } from "react-router-dom";

export default function GroupSearchWrapper() {
  let params = useParams();
  return (
    <main>
      <Navbar />
      <div class="content">
        <article class="mb-3">
          <div class="container pb-3">
            <GroupSearch key={params.id} id={params.id} />
          </div>
        </article>
      </div>
    </main>
  );
}
