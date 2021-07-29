let googleUser;
let currentEditingNoteId;

window.onload = (event) => {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      console.log('Logged in as: ' + user.displayName);
      googleUser = user;
      const googleUserId = user.uid;
      getNotes(googleUserId);
    } else {
      window.location = 'index.html'; 
    };
  });
};

const getNotes = (userId) => {
  const notesRef = firebase.database().ref(`users/${userId}`);
  notesRef.on('value', (snapshot) => {
    const data = snapshot.val();
    renderCard(data);
  });
};

const renderCard = (data) => {
  let cards = ``;
  for(const key in data) {
    const note = data[key];
    cards += createCard(note, key);

  }
  document.querySelector('#app').innerHTML = cards;
};

const createCard = (note, noteId) => {
  return `<div class="column is-one-quarter">
    <div class="card">
        <header class="card-header">
            <p class="card-header-title">
            ${note.title}
            </p>
        </header>
        <div class="card-content">
            <div class="content">
            ${note.text}
            </div>
        </div>
        <footer class="card-footer">
            <a href="#" class="card-footer-item" onclick="editNote('${noteId}')">Edit</a>
            <a href="#" class="card-footer-item" onclick="deleteNote('${noteId}')">Delete</a>
        </footer>
    </div>
  </div>`;
};

const deleteNote = (noteId) => {
    console.log('delete');
    if(confirm('Are you sure you want to delete this note?'))
        firebase.database().ref(`users/${googleUser.uid}/${noteId}`).remove().then(e => console.log('done')).catch(e => console.log(e));
}

const editNote = (noteId) => {

    // it would be better to not make this db call at all because 
    // we already have this data in the html or could send the data
    // to this function via parameters
    firebase.database().ref(`users/${googleUser.uid}/`).once('value', (snapshot) => {
        const data = snapshot.val();
        const noteDetails = data[noteId];
        document.querySelector('#noteTitleInput').value = noteDetails.title;
        document.querySelector('#noteTextInput').value = noteDetails.text;
        document.querySelector('#editNoteModal').classList.add('is-active');
        currentEditingNoteId = noteId;
    });
}

const closeModal = () =>  {
    document.querySelector('#editNoteModal').classList.remove('is-active');
}

const saveChanges = () => {
    firebase.database().ref(`users/${googleUser.uid}/${currentEditingNoteId}`).update({
        title : document.querySelector('#noteTitleInput').value,
        text : document.querySelector('#noteTextInput').value
    }).then(e => closeModal()).catch(e => console.log(e));
}