import stickyNoteStyles from "../StickyNote/StickyNote.module.scss";
import projectStyles from "../Project/Project.module.scss";

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const note = document.querySelector(
        `[data-note-id="${entry.target.id}"]`,
      );

      if (!entry.isIntersecting) {
        note?.classList.remove(stickyNoteStyles.active);
      } else {
        note?.classList.add(stickyNoteStyles.active);
      }
    });
  },
  {
    threshold: 0.5,
  },
);

const projects = document.querySelectorAll(`.${projectStyles.project}`);
const about = document.getElementById("about");
[...projects, about].forEach((project) => {
  if (project) {
    observer.observe(project);
  }
});
