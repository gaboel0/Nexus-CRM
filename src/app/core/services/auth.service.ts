import { Injectable, computed, signal } from '@angular/core';
import { Observable, delay, of, switchMap, tap, throwError, timer } from 'rxjs';
import { MOCK_USERS } from '../mocks/mock-data';
import { User } from '../models/crm.models';

/** Chave da sessão no localStorage. Protótipo: a sessão some quando houver token e backend. */
export const AUTH_STORAGE_KEY = 'crm.currentUser';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _currentUser = signal<User | null>(this.loadFromStorage());

  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoggedIn = computed(() => this._currentUser() !== null);

  /** Simula uma chamada HTTP de login. Troque por HttpClient quando tiver backend. */
  login(email: string, password: string): Observable<User> {
    const found = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
    );

    if (!found) {
      return timer(600).pipe(
        switchMap(() => throwError(() => new Error('E-mail ou senha inválidos'))),
      );
    }

    const { password: _password, ...user } = found;
    return of(user).pipe(
      delay(600),
      tap((u) => {
        this._currentUser.set(u);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(u));
      }),
    );
  }

  logout(): void {
    this._currentUser.set(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  private loadFromStorage(): User | null {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }
}
