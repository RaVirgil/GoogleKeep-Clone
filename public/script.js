const url = "http://localhost:3000/notes";
var clickedNote = null;

bootstrap();

function bootstrap() {
  displayNotes();

  searchInput.addEventListener("input", filterNotesList);
  saveNoteButton.addEventListener("click", saveNoteButtonClick);
  updateNoteButton.addEventListener("click", updateNote);
  deleteNoteButton.addEventListener("click", function () {
    deleteNote(clickedNote.id);
  });

  inputNoteTitle.addEventListener("click", function () {
    this.classList.toggle("active");

    toggleAccordion();
  });
}

async function filterNotesList() {
  const filteredInput = searchInput.value.toLowerCase().trim();
  if (filteredInput != "") displayNotesFiltered(filteredInput);
  else displayNotes();
}

async function displayNotesFiltered(titleFilter) {
  let notes = await getNotes();
  notes = notes.filter((note) =>
    note.title.toLowerCase().trim().includes(titleFilter)
  );
  const notesHtml = createNotesHtml(notes);
  const section = document.querySelector("#notesContainer");
  section.innerHTML = null;
  section.append(notesHtml);
}

async function displayNotes() {
  const notes = await getNotes();
  const notesHtml = createNotesHtml(notes);
  const section = document.querySelector("#notesContainer");

  section.innerHTML = null;
  section.append(notesHtml);
}

function getNotes() {
  return fetch(url).then((res) => res.json());
}

function createNotesHtml(notes) {
  const fragment = document.createDocumentFragment();
  const notesList = document.createElement("ul");
  notesList.setAttribute("class", "notes-list");
  notesList.id = "notesList";

  notes.forEach((note) => {
    const noteCard = setupNoteCard(note);

    notesList.appendChild(noteCard);
  });

  fragment.appendChild(notesList);
  return fragment;
}

function setupNoteCard(note) {
  const noteCard = setupCard(note.id, note.backgroundColor, note.textColor);

  const title = setupTitle(note.title);
  const text = setupText(note.text);
  const image = setupImage(note.image);

  noteCard.appendChild(title);
  noteCard.appendChild(text);
  noteCard.appendChild(image);

  return noteCard;
}

function setupCard(id, backgroundColor, textColor) {
  const noteCard = document.createElement("li");

  noteCard.id = id;
  noteCard.addEventListener("click", onClickCard);
  noteCard.setAttribute("class", "notes-list-item");
  noteCard.style.height = "fit-content";
  noteCard.style.width = "fit-content";
  noteCard.style.backgroundColor = backgroundColor;
  noteCard.style.color = textColor;

  return noteCard;
}

function onClickCard(event) {
  clickedNote = event.currentTarget;
  openModal();
}

function openModal() {
  modalInputTitle.value = clickedNote.children[0].innerHTML;
  modalInputText.value = clickedNote.children[1].innerHTML;
  colorPickerModal.value = rgbToHex(clickedNote.style.backgroundColor);
  const modal = $("#noteModal");
  modal.modal("show");
}

function rgbToHex(rgb) {
  if (rgb.search("rgb") == -1) {
    return rgb;
  } else {
    rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);
    function hex(x) {
      return ("0" + parseInt(x).toString(16)).slice(-2);
    }
    return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
  }
}

function setupTitle(noteTitle) {
  const title = document.createElement("h4");
  title.id = "cardTitle";
  title.innerHTML = noteTitle;
  return title;
}

function setupText(noteText) {
  const text = document.createElement("p");
  text.id = "cardText";
  text.innerHTML = noteText;
  return text;
}

function setupImage(noteImageUrl) {
  const image = document.createElement("img");
  image.id = "cardImage";
  image.src = noteImageUrl;
  image.alt = "image not set";
  image.style.maxHeight = "500px";
  image.style.maxWidth = "400px";

  return image;
}

function saveNoteButtonClick() {
  const title = inputNoteTitle.value;
  const text = inputNoteText.value;
  // idk how to make this image picker work
  // I can't import module fs for moving the file from target to ./photos
  // I can't just pick an image and load it, I get some security errors
  // placed placeholder instead, atleast its a photo there

  // const imageFile = inputNoteImage.files[0];
  // let image = new FormData();
  // image.append('image',imageFile);
  const image = "./placeholder.png";

  const backgroundColor = colorPicker.value;
  let textColor = "white";

  if (!tinycolor(backgroundColor).isDark()) textColor = "black";

  const note = { title, text, image, backgroundColor, textColor };

  postNote(note);
  accordionPanel.style.display = "none";
  accordionPanel.style.height = "fit-content";
  inputSectionForm.style.height = "fit-content";
}

function postNote(note) {
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  }).then(() => displayNotes());
}

function closeModal() {
  $("#noteModal").modal("hide");
}

function updateNote() {
  const title = modalInputTitle.value;
  const text = modalInputText.value;
  const id = clickedNote.id;
  const backgroundColor = colorPickerModal.value;
  let textColor = "white";

  if (!tinycolor(backgroundColor).isDark()) textColor = "black";

  const note = { title, text, id, backgroundColor, textColor };
  patchNote(clickedNote.id, note);
  closeModal();
}

function patchNote(id, note) {
  fetch(url + "/" + id, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  }).then(() => displayNotes());
}

function deleteNote(id) {
  fetch(url + "/" + id, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  }).then(() => displayNotes());
}

function toggleAccordion() {
  accordion.style.boxShadow = "none";
  inputSectionForm.style.height = "100%";
  inputSectionForm.style.boxShadow =
    "3px 3px 15px 2px rgba(204, 204, 204, 0.74)";
  accordionPanel.style.height = "80%";
  accordionPanel.style.display = "flex";
  accordionPanel.style.justifyContent = "space-evenly";
  accordionPanel.style.flexFlow = "column wrap";
}
