/*
	auteur: Hamoji
	Company: Enix Computer
	date: 26/01/2016
	titre: web Sticky note
	version : 1.0
-*- feuille de script -*-
*/

// initialisation de la base de donnee
var db = null;
// verificaation de la presence de la base de donnee cote client
if(window.openDatabase){
	db = openDatabase("NoteTest", "1.0", "Stickys Database", 10000000);

	if(!db){
		console.log("Erreur d'ouverture de la ba de donnée");
	}
} else {
	alert("Erreur: Assurez vous que votre navigateur accepte la base de donnée côté client");
}
var captured = null;
var highestId = 0;
var highestZ = 0;
// var date = new Date();

function Note() {
	// body...
	var self = this;

	/* creation du div de class = note
		et ajout de ses evenements*/
	var note = 	document.createElement('div');
	note.className = 'note';
	note.addEventListener('mousedown', function(e){
		return self.onMouseDown(e);
	}, false);
	note.addEventListener('click', function(){
		return self.onNoteClick;
	}, false);

	this.note = note;

/* creation du div de class = closebtn
	et ajout de ses evenements*/
	var close = document.createElement('div');
	close.className = 'closebtn';
	close.addEventListener('click', function(e){
		return self.close(e);
	}, false);
	note.appendChild(close);

	/* creation du div de class = edit
		et ajout de ses evenements*/
		var edit = document.createElement('div');
		edit.className = 'edit';
		edit.setAttribute('contenteditable', true);
		edit.setAttribute('maxlength', '100');
		edit.innerText = 'Saisissez votre note ici...';
		edit.addEventListener('keyup', function(){
			return self.onkeyUp();
		}, false);
		note.appendChild(edit);
		this.editField = edit;

		/* creation du div de class = timestamp
			et ajout de ses evenements*/
			var ts = document.createElement('div');
			ts.className= 'timestamp';
			ts.setAttribute('contenteditable', false);
			ts.addEventListener('mousedown', function(e){
				return self.onMouseDown(e);
			}, false);
			note.appendChild(ts);
			this.lastModified = ts;

			document.body.appendChild(note);
			return this;
}

Note.prototype = {
	get id(){
		if(!("_id" in this))
			this._id = 0;
		return this._id;
	},
	set id(x){
		this._id = x;
	},

	get text(){
		 return this.editField.innerHTML;
	 },
	set text(x){
		this.editField.innerHTML = x;
	},

	get timestamp(){
		if(!("_timestamp" in this))
				this._timestamp = 0;
			return this._timestamp;
	},
	set timestamp(x){
		if(this._timestamp == x){
			return;
		}
		var date = new Date();
		this._timestamp = x;
		date.setTime(parseFloat(x));
		this.lastModified.textContent = modifiedString(date);
	},

	get left(){
		return this.note.style.left;
	},
	set left(x){
		this.note.style.left = x;
	},

	get top(){
		return this.note.style.top;
	},
	set top(x){
		this.note.style.top = x;
	},

	get zIndex(){
		return this.note.style.zIndex;
	},
	set zIndex(x){
		this.note.style.zIndex = x;
	},

	close:function(e){
		this.cancelPendingSave();
		var note = this;
		db.transaction(function(tx){
			tx.executeSql("DELETE FROM CourseOnline_1 WHERE id=?", [note.id]);
		});
		document.body.removeChild(this.note);
	},

	saveSoon:function(){
		this.cancelPendingSave();
		var self = this;
		this._saveTimer = setTimeout(function(){self.save();}, 200);
	},


	cancelPendingSave: function(){
		if(!("saveTimer" in this)){
			return;
		}
		clearTimeout(this._saveTimer);
		delete this._saveTimer;
	},

	save: function(){
		this.cancelPendingSave();
		if("dirty" in this){
			this.timestamp = new Date().getTime();
			delete this.dirty;
		}

		var note = this;
		db.transaction(function(tx){
			// mise a jour de la base de donnee cote client
			tx.executeSql("Update CourseOnline_1 SET note=?, timestamp=?, left=?, top=?, zindex=? WHERE id=?", [note.text, note.timestamp, note.left, note.top, note.zIndex, note.id]);
		});
	},

	saveAsNew:function(){
		this.timestamp = new Date().getTime();
		var note = this;
		db.transaction(function(tx){
			tx.executeSql("INSERT INTO CourseOnline_1 (id, note, timestamp, left, top, zindex) VALUES(?,?,?,?,?,?)",[note.id, note.text, note.timestamp, note.left, note.top, note.zIndex]);
		});
	},


	/*
		prototype des methodes de deplacement
	*/
	onMouseDown: function(e){
		captured = this;
		this.startX = e.clientX - this.note.offsetLeft;
		this.startY = e.clientY - this.note.offsetTop;
		this.zindex = ++highestZ;

		var self = this;
		if(!("mouseMoveHandler" in this)){
			this.mouseMoveHandler = function(e){return self.onMouseMove(e)}
			this.mouseUpHandler = function(e){return self.onMouseUp(e)}
		}
		document.addEventListener("mousemove", this.mouseMoveHandler, true);
		document.addEventListener("mouseup", this.mouseUpHandler, true);
		return false;
	},

	onMouseMove: function(e){
		if(this != captured){
			return true;
		}
		this.left = e.clientX - this.startX + 'px';
		this.top = e.clientY - this.startY + 'px';
		return false;
	},

	onMouseUp: function(){
		document.removeEventListener("mousemove", this.mouseMoveHandler, true);
		document.removeEventListener("mouseup", this.mouseUpHandler, true);
		this.save();
		return false;
	},

	onNoteClick: function(e){
		this.editField.focus();
		getSelection().collapseToEnd();
	},

	onkeyUp: function(){
		this.dirty = true;
		this.saveSoon();
	} // fin deplacement
} // fin des prototypes

function loaded(){
	console.log("base de donne");
	db.transaction(function(tx){
		tx.executeSql("SELECT COUNT(*) FROM CourseOnline_1", [], function(result){
			loadNotes();
			console.log("recuperation des informations dans la base de donnees");
		}, function(tx, error){
			console.log("creation de la base de donnee");
			tx.executeSql("CREATE TABLE CourseOnline_1 (id REAL UNIQUE, note TEXT, timestamp REAL, left TEXT, top TEXT, zindex REAL)", [], function(result){loadNotes();});
		});
	});
}

function loadNotes(){
	db.transaction(function(tx){
		tx.executeSql("SELECT id, note, timestamp, left, top, zindex FROM CourseOnline_1", [], function(tx, result){
			for(var i = 0; i<result.rows.length; ++i){
				var row = result.rows.item(i);
				var note = new Note();
				note.id = row['id'];
				note.text = row['note'];
				note.timestamp = row['timestamp'];
				note.left = row['left'];
				note.top = row['top'];
				note.zIndex = row['zindex'];

				if(row['id']>highestId){
					highestId = row['id'];
				}
				if(row['zindex']>highestId){
					highestZ = row['zindex'];
				}
			}// end for

			if(!result.rows.length){
				newNote();
			}
		}, function(tx,error){
			console.log("Erreur note- "+error.message);
		});
	});
}

function modifiedString(date){
	return "Derniere modification: " + (date.getMonth() + 1) + "-" + date.getFullYear() + "," + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}

function newNote(){
	// function creation d'un sticky
	var note = new Note();
	note.id = ++highestId;
	note.timestamp = new Date().getTime();
	note.left = Math.round(Math.random() * 400) + "px";
	note.left = Math.round(Math.random() * 500) + "spx";
	note.zIndex == ++highestZ;
	note.saveAsNew();
}

loaded();
//  if(db != null){
//  	document.addEventListener("load", loaded, false);
// }
