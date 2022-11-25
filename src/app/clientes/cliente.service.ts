import { Injectable } from '@angular/core';
// import { formatDate, DatePipe } from '@angular/common';
// import { CLIENTES } from './clientes.json';
import { Cliente } from './cliente';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpRequest, HttpEvent } from '@angular/common/http';
import { map, catchError, tap } from 'rxjs/operators';
// import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { Region } from './region';
// import { AuthService } from '../usuarios/auth.service';

@Injectable({
  providedIn: "root",
})
export class ClienteService {
  private urlEndPoint = 'http://localhost:8080/api/clientes';

  // private httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(
    private http: HttpClient,
    private router: Router,
    // private authService: AuthService
  ) {}

  /* private agregarAuthorizationHeader() {
    let token = this.authService.token;
    if (token != null) {
      return this.httpHeaders.append('Authorization', 'Bearer' + token)
    }
    return this.httpHeaders;
  } */

  /* private isNoAutorizado(e): boolean {
    if (e.status === 401) {

      if (this.authService.isAuthenticated()) {
        this.authService.logout();
      }
      this.router.navigate(['/login']);
      return true;
    }

    if (e.status === 403) {
      Swal.fire('Acceso denegado', `Hola ${this.authService.usuario.username} no tienes acceso a este recurso!`, 'warning');
      this.router.navigate(['/clientes']);
      return true;
    }

    return false;
  } */

  getRegiones(): Observable<Region[]> {
    return this.http.get<Region[]>(this.urlEndPoint + '/regiones');
  }

  getClientes(page: number): Observable<Cliente[]> {
    return this.http.get(this.urlEndPoint + '/page/' + page).pipe(
      tap((response: any) => {
        console.log('ClienteService: tap 1');
        (response.content as Cliente[]).forEach((cliente) => {
          console.log(cliente.nombre);
        });
      }),
      map((response: any) => {
        (response.content as Cliente[]).map((cliente) => {
          cliente.nombre = cliente.nombre.toUpperCase();
          // registerLocaleData(localeES, 'es');
          // let datePipe = new DatePipe('es');
          // cliente.createAt = datePipe.transform(cliente.createAt, 'EEE dd, MMMM yyyy');
          // formatDate(cliente.createAt, 'dd-MM-yyyy', 'en-US');
          return cliente;
        });
        return response;
      }),
      tap((response) => {
        console.log('ClienteService: tap 2');
        (response.content as Cliente[]).forEach((cliente) => {
          console.log(cliente.nombre);
        });
      })
    );
  }

  create(cliente: Cliente): Observable<Cliente> {

    console.log('Valor del objeto cliente: ');
    console.log(cliente);

    return this.http
      .post(this.urlEndPoint, cliente)
      .pipe(
        map((response: any) => response.cliente as Cliente),
        catchError((e) => {

          /* if (this.isNoAutorizado(e)) {
            return throwError(e);
          } */

          if (e.status === 400) {
            return throwError(e);
          }

          if (e.error.mensaje) {
            console.error(e.error.mensaje);
          }
          // Swal.fire(e.error.mensaje, e.error.error, 'error');
          return throwError(e);
        })
      );
  }

  getCliente(id): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.urlEndPoint}/${id}`).pipe(
      catchError((e) => {

        /* if (this.isNoAutorizado(e)) {
          return throwError(e);
        } */
        if (e.status !== 401 && e.error.mensaje) {
          this.router.navigate(['/clientes']);
          console.error(e.error.mensaje);
        }

        // Swal.fire('Error al editar', e.error.mensaje, 'error');
        return throwError(e);
      })
    );
  }

  update(cliente: Cliente): Observable<Cliente> {

    console.log('Valor del objeto cliente: ');
    console.log(cliente);

    return this.http
      .put(`${this.urlEndPoint}/${cliente.id}`, cliente)
      .pipe(
        map((response: any) => response.cliente as Cliente),
        catchError((e) => {

          /* if (this.isNoAutorizado(e)) {
            return throwError(e);
          } */

          if (e.status === 400) {
            return throwError(e);
          }

          if (e.error.mensaje) {
            console.error(e.error.mensaje);
          }
          // Swal.fire(e.error.mensaje, e.error.error, 'error');
          return throwError(e);
        })
      );
  }

  delete(id: number): Observable<Cliente> {
    return this.http
      .delete<Cliente>(`${this.urlEndPoint}/${id}`)
      .pipe(
        catchError((e) => {

          /* if (this.isNoAutorizado(e)) {
            return throwError(e);
          } */

          if (e.error.mensaje) {
            console.error(e.error.mensaje);
          }
          // Swal.fire(e.error.mensaje, e.error.error, 'error');
          return throwError(e);
        })
      );
  }

  subirFoto(archivo: File, id): Observable<HttpEvent<{}>> {

    let formData = new FormData();
    formData.append('archivo', archivo),
    formData.append('id', id);

    /* let httpHeaders = new HttpHeaders();
    let token = this.authService.token;
    if (token != null) {
      httpHeaders = httpHeaders.append('Authorization', 'Bearer' + token);
    } */

    const req = new HttpRequest(
      'POST',
      `${this.urlEndPoint}/upload`,
      formData,
      {
        reportProgress: true,
        // headers: httpHeaders
      }
    );

    return this.http.request(req);
    /* .pipe (
      catchError(e => {
        this.isNoAutorizado(e);
        return throwError(e);
      })
    );*/

    /*return this.http.post().pipe (
      map( (response: any) => response.cliente as Cliente),
      catchError(e => {
        console.error(e.error.mensaje);
        Swal.fire(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      }
    ); */
  }
}
