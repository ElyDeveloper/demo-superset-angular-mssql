import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { embedDashboard } from '@superset-ui/embedded-sdk';
import { catchError, Observable, switchMap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SupersetEmbedService {
  private supersetUrl = 'http://localhost:8088';
  private supersetApiUrl = `${this.supersetUrl}/api/v1/security`;
  private dashboardId = '9cf9fd1f-a515-4e3d-b7a6-461d011821e9';

  private http = inject(HttpClient);

  getToken() {
    //calling login to get access token
    const body = {
      password: 'tester@2024',
      provider: 'db',
      refresh: true,
      username: 'tester_admin',
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http
      .post(`${this.supersetApiUrl}/login`, body, { headers })
      .pipe(
        catchError((error: any) => {
          console.error(error);
          return throwError(error);
        }),
        switchMap((accessToken: any) => {
          const body = {
            resources: [
              {
                type: 'dashboard',
                id: this.dashboardId,
              },
            ],
            rls: [],
            user: {
              username: 'report-viewer',
              first_name: 'report-viewer',
              last_name: 'report-viewer',
            },
          };

          const acc = accessToken['access_token'];
          // console.log('Token de acceso: ', acc);
          const headers = new HttpHeaders({
            "Content-Type": 'application/json',
            "Authorization": `Bearer ${acc}`,
          });

          // console.log('Headers de acceso: ', headers);

          return this.http.post<any>(
            `${this.supersetApiUrl}/guest_token/`,
            body,
            { headers }
          );
        })
      );
  }

  // Above part should be implemented in backend and should only be called here to get guest token.

  embedDashboardU() {
    return new Observable((observer) => {
      this.getToken().subscribe({
        next: (token: any) => {
          console.log('Token recibido: ', token['token']);
          embedDashboard({
            id: this.dashboardId,
            supersetDomain: this.supersetUrl,
            mountPoint: document.getElementById(
              'superset_embedding_div_class'
            )!,
            fetchGuestToken: () => token['token'],
            dashboardUiConfig: {
              hideTitle: true,
              hideChartControls: true,
              hideTab: true,
              filters: {
                visible: false,
                expanded: false,
              },
              urlParams: {
                standalone: "1",
                show_filters: "0",
                show_native_filters: "0"
              }
            },
          })
            .then(() => {
              console.log('Dashboard embedded successfully');
              observer.next();
              observer.complete();
            })
            .catch((error) => {
              console.error('Error embedding dashboard:', error);
              observer.error(error);
            });
        },
        error: (error: any) => {
          console.error('Error getting token:', error);
          observer.error(error);
        },
      });
    });
  }
}
