import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NOTES } from '../../../notes';
import { Router } from '@angular/router';
import { AddMessageService } from 'src/app/services/addMessage/add-message.service';

@Component({
	selector: 'app-add-note',
	templateUrl: './add-note.component.html',
	styleUrls: ['./add-note.component.scss'],
})
export class AddNoteComponent {
	constructor(private addMessageService: AddMessageService) {}

	noteTitle = 'Your post title';
	noteText = 'Create message for share with your friends.';

	// time and short date
	date = new Date();
	formattedDate =
		this.date.toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: 'numeric',
			hour12: true,
		}) +
		' ' +
		this.date
			.toLocaleDateString('en-US', {
				year: '2-digit',
				month: '2-digit',
				day: '2-digit',
			})
			.replace(/\//g, '-');

	// user name
	user = 'User';

	// form validation
	addNoteForm = new FormGroup({
		title: new FormControl('', Validators.required),
		text: new FormControl(''),
	});

	// decode token for get user id
	private token = localStorage.getItem('token');
	private decoded = this.token
		? JSON.parse(atob(this.token.split('.')[1])).data
		: null;

	// router for redirect
	router = inject(Router);

	// dialog
	isDialogOpen = false;
	dialogMessage = '';
	dialogImg = '';

	closeDialog() {
		this.addNoteForm.reset();
		this.isDialogOpen = false;
		this.router.navigateByUrl('/notes');
	}

	addNote() {
		let title = this.addNoteForm.value.title ?? '';
		let text = this.addNoteForm.value.text ?? '';

		if (this.addNoteForm.valid) {
			let newNote = {
				title: title,
				body: text,
				UserId: this.decoded.data.id,
			};

			this.isDialogOpen = true;

			try {
				this.addMessageService.addMessage(newNote).subscribe(
					(res: any) => {
						this.dialogMessage = 'Post Created';
						this.dialogImg = '../../../assets/noteCreated.svg';
					},
					(error) => {
						console.log(error);
						this.dialogMessage = 'Uppss Try Later';
						this.dialogImg = '../../../assets/noteErrorCreate.svg';
					}
				);
			} catch (error) {
				console.log(error);
			}
		}
	}
}
