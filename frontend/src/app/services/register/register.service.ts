import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root',
})
export class RegisterService {
	api_url = 'http://localhost:3000/api/register';

	constructor(private http: HttpClient) {}

	register(userData: any) {
		return this.http.post<any>(this.api_url, {
			name: userData.fullName,
			email: userData.email,
			password: userData.password,
		});
	}

	error(error: HttpErrorResponse) {
		console.log(error);
	}
}
